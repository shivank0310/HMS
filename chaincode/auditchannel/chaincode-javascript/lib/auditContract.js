'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class AuditContract extends DynamicRecordContract {
    constructor() {
        super('auditchannel', 'AuditRecord', {
            LogAudit: '_createRecord',
            UpdateAudit: '_updateRecord',
            GetAudit: '_getRecord',
            DeleteAudit: '_deleteRecord',
            ListAudits: '_listRecords',
            QueryAuditByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(AuditContract, {
    LogAudit: '_createRecord',
    UpdateAudit: '_updateRecord',
    GetAudit: '_getRecord',
    DeleteAudit: '_deleteRecord',
    ListAudits: '_listRecords',
    QueryAuditByField: '_queryByField',
});

module.exports = AuditContract;
