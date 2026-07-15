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

function normalizeBloodGroup(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const bloodGroup = String(value).toUpperCase();
    const allowed = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
    if (!allowed.has(bloodGroup)) {
        throw new Error(`Invalid bloodGroup value: ${value}`);
    }
    return bloodGroup;
}

class PatientContract extends Contract {
    constructor() {
        super('PatientContract');
        this.channelName = 'patientchannel';
        this.recordType = 'PatientRecord';
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

    _applyBusinessRules(record, isCreate = false) {
        const normalized = { ...record };

        if (normalized.dateOfBirth !== undefined && !isValidDate(normalized.dateOfBirth)) {
            throw new Error('dateOfBirth must be a valid ISO date string');
        }

        if (normalized.admissionDate !== undefined && !isValidDate(normalized.admissionDate)) {
            throw new Error('admissionDate must be a valid ISO date string');
        }

        if (normalized.dischargeDate !== undefined && !isValidDate(normalized.dischargeDate)) {
            throw new Error('dischargeDate must be a valid ISO date string');
        }

        if (normalized.bloodGroup !== undefined) {
            normalized.bloodGroup = normalizeBloodGroup(normalized.bloodGroup);
        }

        if (normalized.status === undefined || normalized.status === null || normalized.status === '') {
            normalized.status = 'active';
        } else {
            normalized.status = String(normalized.status).toLowerCase();
        }

        if (normalized.status === 'inactive' && normalized.dischargeDate === undefined && isCreate) {
            normalized.status = 'active';
        }

        if (normalized.emergencyContactPhone !== undefined) {
            normalized.emergencyContactPhone = String(normalized.emergencyContactPhone);
        }

        if (normalized.medicalRecordNumber !== undefined) {
            normalized.medicalRecordNumber = String(normalized.medicalRecordNumber);
        }

        if (normalized.allergies !== undefined && !Array.isArray(normalized.allergies)) {
            normalized.allergies = [normalized.allergies];
        }

        if (normalized.conditions !== undefined && !Array.isArray(normalized.conditions)) {
            normalized.conditions = [normalized.conditions];
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
        const record = this._applyBusinessRules(
            {
                ...dynamicFields,
                recordId,
                patientId: recordId,
                docType: this.recordType,
                channel: this.channelName,
                createdAt: timestamp,
                updatedAt: timestamp,
            },
            true
        );

        return this._writeRecord(ctx, recordId, record);
    }

    async _updateRecord(ctx, recordId, fieldsJson) {
        const existing = await this._readRecord(ctx, recordId);
        const dynamicFields = parseFields(fieldsJson);
        const timestamp = normalizeTimestamp(ctx.stub.getTxTimestamp());
        const updated = this._applyBusinessRules(
            {
                ...existing,
                ...dynamicFields,
                recordId,
                patientId: existing.patientId || recordId,
                docType: this.recordType,
                channel: this.channelName,
                createdAt: existing.createdAt || timestamp,
                updatedAt: timestamp,
            }
        );

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

    async RegisterPatient(ctx, recordId, fieldsJson) {
        return this._createRecord(ctx, recordId, fieldsJson);
    }

    async UpdatePatient(ctx, recordId, fieldsJson) {
        return this._updateRecord(ctx, recordId, fieldsJson);
    }

    async GetPatient(ctx, recordId) {
        return this._getRecord(ctx, recordId);
    }

    async DeletePatient(ctx, recordId) {
        return this._deleteRecord(ctx, recordId);
    }

    async ListPatients(ctx) {
        return this._listRecords(ctx);
    }

    async QueryPatientByField(ctx, fieldName, fieldValue) {
        return this._queryByField(ctx, fieldName, fieldValue);
    }

    async InitLedger(ctx) {
        const sampleId = 'patient-sample-001';
        if (await this._recordExists(ctx, sampleId)) {
            return 'Ledger already initialized';
        }

        await this._createRecord(
            ctx,
            sampleId,
            JSON.stringify({
                fullName: 'Sample Patient',
                dateOfBirth: '1990-01-01',
                bloodGroup: 'O+',
                gender: 'unknown',
                status: 'active',
                note: 'Bootstrap patient record for the patient channel',
            })
        );
        return sampleId;
    }
}

module.exports = PatientContract;
