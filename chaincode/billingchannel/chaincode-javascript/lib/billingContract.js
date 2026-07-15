'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

function canonicalize(record) {
    return sortKeysRecursive(record);
}

function asBuffer(record) {
    return Buffer.from(stringify(canonicalize(record)));
}

function parseFields(fieldsJson) {
    if (fieldsJson === undefined || fieldsJson === null || fieldsJson === '') {
        return {};
    }

    let fields;
    if (typeof fieldsJson === 'string') {
        try {
            fields = JSON.parse(fieldsJson);
        } catch (error) {
            throw new Error(`Invalid JSON for record fields: ${error.message}`);
        }
    } else if (typeof fieldsJson === 'object') {
        fields = fieldsJson;
    } else {
        throw new Error('Record fields must be a JSON object string or object');
    }

    if (Array.isArray(fields) || fields === null || typeof fields !== 'object') {
        throw new Error('Record fields must resolve to a JSON object');
    }

    return fields;
}

function normalizeTimestamp(txTimestamp) {
    if (!txTimestamp) {
        return new Date().toISOString();
    }
    if (typeof txTimestamp === 'string') {
        return txTimestamp;
    }
    if (txTimestamp.seconds !== undefined) {
        const seconds = Number(txTimestamp.seconds.low !== undefined ? txTimestamp.seconds.low : txTimestamp.seconds);
        const nanos = Number(txTimestamp.nanos || 0);
        return new Date(seconds * 1000 + nanos / 1000000).toISOString();
    }
    return new Date().toISOString();
}

function isValidDate(value) {
    return value === undefined || value === null || value === '' || !Number.isNaN(Date.parse(value));
}

function normalizeCurrency(value) {
    if (value === undefined || value === null || value === '') {
        return 'USD';
    }

    const currency = String(value).toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
        throw new Error(`Invalid currency value: ${value}`);
    }
    return currency;
}

class BillingContract extends Contract {
    constructor() {
        super('BillingContract');
        this.channelName = 'billingchannel';
        this.recordType = 'BillingRecord';
    }

    async _recordExists(ctx, recordId) {
        const data = await ctx.stub.getState(recordId);
        return data && data.length > 0;
    }

    async _readRecord(ctx, recordId) {
        const data = await ctx.stub.getState(recordId);
        if (!data || data.length === 0) {
            throw new Error(`${this.recordType} record ${recordId} does not exist`);
        }
        return JSON.parse(data.toString());
    }

    async _writeRecord(ctx, recordId, record) {
        await ctx.stub.putState(recordId, asBuffer(record));
        return stringify(canonicalize(record));
    }

    _applyBusinessRules(record) {
        const normalized = { ...record };

        if (normalized.amount !== undefined) {
            const amount = Number(normalized.amount);
            if (Number.isNaN(amount) || amount < 0) {
                throw new Error('amount must be a non-negative number');
            }
            normalized.amount = amount;
        }

        if (normalized.taxAmount !== undefined) {
            const taxAmount = Number(normalized.taxAmount);
            if (Number.isNaN(taxAmount) || taxAmount < 0) {
                throw new Error('taxAmount must be a non-negative number');
            }
            normalized.taxAmount = taxAmount;
        }

        if (normalized.balanceDue !== undefined) {
            const balanceDue = Number(normalized.balanceDue);
            if (Number.isNaN(balanceDue) || balanceDue < 0) {
                throw new Error('balanceDue must be a non-negative number');
            }
            normalized.balanceDue = balanceDue;
        }

        if (normalized.currency !== undefined) {
            normalized.currency = normalizeCurrency(normalized.currency);
        } else {
            normalized.currency = 'USD';
        }

        if (normalized.invoiceDate !== undefined && !isValidDate(normalized.invoiceDate)) {
            throw new Error('invoiceDate must be a valid ISO date string');
        }

        if (normalized.dueDate !== undefined && !isValidDate(normalized.dueDate)) {
            throw new Error('dueDate must be a valid ISO date string');
        }

        if (normalized.paidAt !== undefined && !isValidDate(normalized.paidAt)) {
            throw new Error('paidAt must be a valid ISO date string');
        }

        if (normalized.status === undefined || normalized.status === null || normalized.status === '') {
            normalized.status = 'pending';
        } else {
            normalized.status = String(normalized.status).toLowerCase();
        }

        if (normalized.paymentMethod !== undefined) {
            normalized.paymentMethod = String(normalized.paymentMethod).toLowerCase();
        }

        return normalized;
    }

    async _createRecord(ctx, recordId, fieldsJson) {
        if (!recordId) {
            throw new Error('recordId is required');
        }

        if (await this._recordExists(ctx, recordId)) {
            throw new Error(`${this.recordType} record ${recordId} already exists`);
        }

        const dynamicFields = parseFields(fieldsJson);
        const timestamp = normalizeTimestamp(ctx.stub.getTxTimestamp());
        const record = this._applyBusinessRules({
            ...dynamicFields,
            recordId,
            billId: recordId,
            docType: this.recordType,
            channel: this.channelName,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return this._writeRecord(ctx, recordId, record);
    }

    async _updateRecord(ctx, recordId, fieldsJson) {
        const existing = await this._readRecord(ctx, recordId);
        const dynamicFields = parseFields(fieldsJson);
        const timestamp = normalizeTimestamp(ctx.stub.getTxTimestamp());
        const updated = this._applyBusinessRules({
            ...existing,
            ...dynamicFields,
            recordId,
            billId: existing.billId || recordId,
            docType: this.recordType,
            channel: this.channelName,
            createdAt: existing.createdAt || timestamp,
            updatedAt: timestamp,
        });

        return this._writeRecord(ctx, recordId, updated);
    }

    async _getRecord(ctx, recordId) {
        const record = await this._readRecord(ctx, recordId);
        return stringify(canonicalize(record));
    }

    async _deleteRecord(ctx, recordId) {
        if (!(await this._recordExists(ctx, recordId))) {
            throw new Error(`${this.recordType} record ${recordId} does not exist`);
        }
        await ctx.stub.deleteState(recordId);
        return recordId;
    }

    async _listRecords(ctx) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let entry = await iterator.next();

        while (!entry.done) {
            const value = entry.value.value.toString('utf8');
            try {
                const record = JSON.parse(value);
                if (record.docType === this.recordType) {
                    results.push(record);
                }
            } catch (error) {
                // Ignore non-JSON ledger entries.
            }
            entry = await iterator.next();
        }

        await iterator.close();
        return stringify(canonicalize(results));
    }

    async _queryByField(ctx, fieldName, fieldValue) {
        if (!fieldName) {
            throw new Error('fieldName is required');
        }

        const allRecords = JSON.parse(await this._listRecords(ctx));
        const matches = allRecords.filter((record) => String(record[fieldName]) === String(fieldValue));
        return stringify(canonicalize(matches));
    }

    async CreateBill(ctx, recordId, fieldsJson) {
        return this._createRecord(ctx, recordId, fieldsJson);
    }

    async UpdateBill(ctx, recordId, fieldsJson) {
        return this._updateRecord(ctx, recordId, fieldsJson);
    }

    async GetBill(ctx, recordId) {
        return this._getRecord(ctx, recordId);
    }

    async DeleteBill(ctx, recordId) {
        return this._deleteRecord(ctx, recordId);
    }

    async ListBills(ctx) {
        return this._listRecords(ctx);
    }

    async QueryBillByField(ctx, fieldName, fieldValue) {
        return this._queryByField(ctx, fieldName, fieldValue);
    }

    async InitLedger(ctx) {
        const sampleId = 'bill-sample-001';
        if (await this._recordExists(ctx, sampleId)) {
            return 'Ledger already initialized';
        }

        await this._createRecord(
            ctx,
            sampleId,
            JSON.stringify({
                patientId: 'patient-sample-001',
                invoiceNumber: 'INV-0001',
                amount: 1250.0,
                currency: 'USD',
                status: 'pending',
                note: 'Bootstrap billing record for the billing channel',
            })
        );
        return sampleId;
    }
}

module.exports = BillingContract;
