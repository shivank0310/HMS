'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class PatientContract extends DynamicRecordContract {
    constructor() {
        super('patientchannel', 'PatientRecord', {
            RegisterPatient: '_createRecord',
            UpdatePatient: '_updateRecord',
            GetPatient: '_getRecord',
            DeletePatient: '_deleteRecord',
            ListPatients: '_listRecords',
            QueryPatientByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(PatientContract, {
    RegisterPatient: '_createRecord',
    UpdatePatient: '_updateRecord',
    GetPatient: '_getRecord',
    DeletePatient: '_deleteRecord',
    ListPatients: '_listRecords',
    QueryPatientByField: '_queryByField',
});

module.exports = PatientContract;
