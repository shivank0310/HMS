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

class TreatmentContract extends Contract {
    constructor() {
        super('TreatmentContract');
        this.channelName = 'treatmentchannel';
        this.recordType = 'TreatmentRecord';
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

        if (normalized.startDate !== undefined && !isValidDate(normalized.startDate)) {
            throw new Error('startDate must be a valid ISO date string');
        }

        if (normalized.endDate !== undefined && !isValidDate(normalized.endDate)) {
            throw new Error('endDate must be a valid ISO date string');
        }

        if (normalized.followUpDate !== undefined && !isValidDate(normalized.followUpDate)) {
            throw new Error('followUpDate must be a valid ISO date string');
        }

        if (normalized.startDate !== undefined && normalized.endDate !== undefined) {
            const start = Date.parse(normalized.startDate);
            const end = Date.parse(normalized.endDate);
            if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
                throw new Error('endDate must be on or after startDate');
            }
        }

        if (normalized.status === undefined || normalized.status === null || normalized.status === '') {
            normalized.status = 'planned';
        } else {
            normalized.status = String(normalized.status).toLowerCase();
        }

        if (normalized.priority !== undefined) {
            normalized.priority = String(normalized.priority).toLowerCase();
        }

        if (normalized.procedureCode !== undefined) {
            normalized.procedureCode = String(normalized.procedureCode).trim();
        }

        if (normalized.diagnosis !== undefined) {
            normalized.diagnosis = String(normalized.diagnosis).trim();
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
            treatmentId: recordId,
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
            treatmentId: existing.treatmentId || recordId,
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

    async CreateTreatment(ctx, recordId, fieldsJson) {
        return this._createRecord(ctx, recordId, fieldsJson);
    }

    async UpdateTreatment(ctx, recordId, fieldsJson) {
        return this._updateRecord(ctx, recordId, fieldsJson);
    }

    async GetTreatment(ctx, recordId) {
        return this._getRecord(ctx, recordId);
    }

    async DeleteTreatment(ctx, recordId) {
        return this._deleteRecord(ctx, recordId);
    }

    async ListTreatments(ctx) {
        return this._listRecords(ctx);
    }

    async QueryTreatmentByField(ctx, fieldName, fieldValue) {
        return this._queryByField(ctx, fieldName, fieldValue);
    }

    async InitLedger(ctx) {
        const sampleId = 'treatment-sample-001';
        if (await this._recordExists(ctx, sampleId)) {
            return 'Ledger already initialized';
        }

        await this._createRecord(
            ctx,
            sampleId,
            JSON.stringify({
                patientId: 'patient-sample-001',
                doctorId: 'doctor-sample-001',
                diagnosis: 'Routine follow-up',
                treatmentPlan: 'Observation and hydration',
                status: 'planned',
                note: 'Bootstrap treatment record for the treatment channel',
            })
        );
        return sampleId;
    }
}

module.exports = TreatmentContract;
