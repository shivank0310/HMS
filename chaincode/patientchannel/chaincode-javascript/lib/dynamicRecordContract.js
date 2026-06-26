'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class DynamicRecordContract extends Contract {
    constructor(channelName, recordType, functionMap) {
        super(channelName);
        this.channelName = channelName;
        this.recordType = recordType;
        this.functionMap = functionMap;
    }

    _parseDynamicFields(fieldsJson) {
        if (fieldsJson === undefined || fieldsJson === null || fieldsJson === '') {
            return {};
        }

        let fields;
        if (typeof fieldsJson === 'string') {
            try {
                fields = JSON.parse(fieldsJson);
            } catch (error) {
                throw new Error(`Invalid JSON for dynamic fields: ${error.message}`);
            }
        } else if (typeof fieldsJson === 'object') {
            fields = fieldsJson;
        } else {
            throw new Error('Dynamic fields must be a JSON object string');
        }

        if (Array.isArray(fields) || fields === null || typeof fields !== 'object') {
            throw new Error('Dynamic fields must resolve to a JSON object');
        }

        return fields;
    }

    _toBuffer(record) {
        return Buffer.from(stringify(sortKeysRecursive(record)));
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
        await ctx.stub.putState(recordId, this._toBuffer(record));
        return stringify(sortKeysRecursive(record));
    }

    _normalizeTimestamp(txTimestamp) {
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

    async _createRecord(ctx, recordId, fieldsJson) {
        if (!recordId) {
            throw new Error('recordId is required');
        }

        const exists = await this._recordExists(ctx, recordId);
        if (exists) {
            throw new Error(`${this.recordType} record ${recordId} already exists`);
        }

        const dynamicFields = this._parseDynamicFields(fieldsJson);
        const timestamp = this._normalizeTimestamp(ctx.stub.getTxTimestamp());
        const record = {
            ...dynamicFields,
            recordId,
            docType: this.recordType,
            channel: this.channelName,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        return this._writeRecord(ctx, recordId, record);
    }

    async _updateRecord(ctx, recordId, fieldsJson) {
        const existing = await this._readRecord(ctx, recordId);
        const dynamicFields = this._parseDynamicFields(fieldsJson);
        const timestamp = this._normalizeTimestamp(ctx.stub.getTxTimestamp());
        const updated = {
            ...existing,
            ...dynamicFields,
            recordId,
            docType: this.recordType,
            channel: this.channelName,
            updatedAt: timestamp,
        };

        return this._writeRecord(ctx, recordId, updated);
    }

    async _getRecord(ctx, recordId) {
        const record = await this._readRecord(ctx, recordId);
        return stringify(sortKeysRecursive(record));
    }

    async _deleteRecord(ctx, recordId) {
        const exists = await this._recordExists(ctx, recordId);
        if (!exists) {
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
        return stringify(sortKeysRecursive(results));
    }

    async _queryByField(ctx, fieldName, fieldValue) {
        if (!fieldName) {
            throw new Error('fieldName is required');
        }

        const allRecords = JSON.parse(await this._listRecords(ctx));
        const matches = allRecords.filter((record) => String(record[fieldName]) === String(fieldValue));
        return stringify(sortKeysRecursive(matches));
    }

    async InitLedger(ctx) {
        const sampleId = `${this.recordType.toLowerCase()}-sample-001`;
        const exists = await this._recordExists(ctx, sampleId);
        if (exists) {
            return 'Ledger already initialized';
        }

        const sampleFields = {
            status: 'active',
            note: `Sample ${this.recordType} record for ${this.channelName}`,
        };

        await this._createRecord(ctx, sampleId, JSON.stringify(sampleFields));
        return sampleId;
    }
}

function bindDynamicFunctions(ContractClass, functionMap) {
    Object.entries(functionMap).forEach(([methodName, handlerName]) => {
        if (handlerName === '_listRecords') {
            ContractClass.prototype[methodName] = async function listHandler(ctx) {
                return this[handlerName](ctx);
            };
            return;
        }

        if (handlerName === '_queryByField') {
            ContractClass.prototype[methodName] = async function queryHandler(ctx, fieldName, fieldValue) {
                return this[handlerName](ctx, fieldName, fieldValue);
            };
            return;
        }

        if (handlerName === '_getRecord' || handlerName === '_deleteRecord') {
            ContractClass.prototype[methodName] = async function readHandler(ctx, recordId) {
                return this[handlerName](ctx, recordId);
            };
            return;
        }

        ContractClass.prototype[methodName] = async function writeHandler(ctx, recordId, fieldsJson) {
            return this[handlerName](ctx, recordId, fieldsJson);
        };
    });
}

module.exports = {
    DynamicRecordContract,
    bindDynamicFunctions,
};
