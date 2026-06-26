'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class TreatmentContract extends DynamicRecordContract {
    constructor() {
        super('treatmentchannel', 'TreatmentRecord', {
            CreateTreatment: '_createRecord',
            UpdateTreatment: '_updateRecord',
            GetTreatment: '_getRecord',
            DeleteTreatment: '_deleteRecord',
            ListTreatments: '_listRecords',
            QueryTreatmentByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(TreatmentContract, {
    CreateTreatment: '_createRecord',
    UpdateTreatment: '_updateRecord',
    GetTreatment: '_getRecord',
    DeleteTreatment: '_deleteRecord',
    ListTreatments: '_listRecords',
    QueryTreatmentByField: '_queryByField',
});

module.exports = TreatmentContract;
