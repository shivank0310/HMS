'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class PharmacyContract extends DynamicRecordContract {
    constructor() {
        super('pharmacychannel', 'PharmacyRecord', {
            DispenseDrug: '_createRecord',
            UpdateDispense: '_updateRecord',
            GetDispense: '_getRecord',
            DeleteDispense: '_deleteRecord',
            ListDispenses: '_listRecords',
            QueryDispenseByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(PharmacyContract, {
    DispenseDrug: '_createRecord',
    UpdateDispense: '_updateRecord',
    GetDispense: '_getRecord',
    DeleteDispense: '_deleteRecord',
    ListDispenses: '_listRecords',
    QueryDispenseByField: '_queryByField',
});

module.exports = PharmacyContract;
