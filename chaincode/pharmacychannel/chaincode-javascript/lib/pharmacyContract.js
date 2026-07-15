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

class PharmacyContract extends Contract {
    constructor() {
        super('PharmacyContract');
        this.channelName = 'pharmacychannel';
        this.recordType = 'PharmacyRecord';
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

        if (normalized.quantity !== undefined) {
            const quantity = Number(normalized.quantity);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error('quantity must be a positive integer');
            }
            normalized.quantity = quantity;
        }

        if (normalized.refillsRemaining !== undefined) {
            const refillsRemaining = Number(normalized.refillsRemaining);
            if (!Number.isInteger(refillsRemaining) || refillsRemaining < 0) {
                throw new Error('refillsRemaining must be a non-negative integer');
            }
            normalized.refillsRemaining = refillsRemaining;
        }

        if (normalized.unitPrice !== undefined) {
            const unitPrice = Number(normalized.unitPrice);
            if (Number.isNaN(unitPrice) || unitPrice < 0) {
                throw new Error('unitPrice must be a non-negative number');
            }
            normalized.unitPrice = unitPrice;
        }

        if (normalized.dispensedAt !== undefined && !isValidDate(normalized.dispensedAt)) {
            throw new Error('dispensedAt must be a valid ISO date string');
        }

        if (normalized.expiresAt !== undefined && !isValidDate(normalized.expiresAt)) {
            throw new Error('expiresAt must be a valid ISO date string');
        }

        if (normalized.status === undefined || normalized.status === null || normalized.status === '') {
            normalized.status = 'requested';
        } else {
            normalized.status = String(normalized.status).toLowerCase();
        }

        if (normalized.status === 'dispensed' && normalized.dispensedAt === undefined) {
            normalized.dispensedAt = normalizeTimestamp();
        }

        if (normalized.drugName !== undefined) {
            normalized.drugName = String(normalized.drugName).trim();
        }

        if (normalized.dosage !== undefined) {
            normalized.dosage = String(normalized.dosage).trim();
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
            dispenseId: recordId,
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
            dispenseId: existing.dispenseId || recordId,
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

    async DispenseDrug(ctx, recordId, fieldsJson) {
        return this._createRecord(ctx, recordId, fieldsJson);
    }

    async UpdateDispense(ctx, recordId, fieldsJson) {
        return this._updateRecord(ctx, recordId, fieldsJson);
    }

    async GetDispense(ctx, recordId) {
        return this._getRecord(ctx, recordId);
    }

    async DeleteDispense(ctx, recordId) {
        return this._deleteRecord(ctx, recordId);
    }

    async ListDispenses(ctx) {
        return this._listRecords(ctx);
    }

    async QueryDispenseByField(ctx, fieldName, fieldValue) {
        return this._queryByField(ctx, fieldName, fieldValue);
    }

    async InitLedger(ctx) {
        const sampleId = 'dispense-sample-001';
        if (await this._recordExists(ctx, sampleId)) {
            return 'Ledger already initialized';
        }

        await this._createRecord(
            ctx,
            sampleId,
            JSON.stringify({
                patientId: 'patient-sample-001',
                drugName: 'Amoxicillin',
                dosage: '500mg',
                quantity: 14,
                status: 'requested',
                note: 'Bootstrap pharmacy record for the pharmacy channel',
            })
        );
        return sampleId;
    }
}

module.exports = PharmacyContract;
