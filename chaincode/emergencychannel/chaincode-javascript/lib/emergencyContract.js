'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class EmergencyContract extends DynamicRecordContract {
    constructor() {
        super('emergencychannel', 'EmergencyRecord', {
            LogEmergency: '_createRecord',
            UpdateEmergency: '_updateRecord',
            GetEmergency: '_getRecord',
            DeleteEmergency: '_deleteRecord',
            ListEmergencies: '_listRecords',
            QueryEmergencyByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(EmergencyContract, {
    LogEmergency: '_createRecord',
    UpdateEmergency: '_updateRecord',
    GetEmergency: '_getRecord',
    DeleteEmergency: '_deleteRecord',
    ListEmergencies: '_listRecords',
    QueryEmergencyByField: '_queryByField',
});

module.exports = EmergencyContract;
