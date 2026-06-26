'use strict';

const { DynamicRecordContract, bindDynamicFunctions } = require('./dynamicRecordContract');

class BillingContract extends DynamicRecordContract {
    constructor() {
        super('billingchannel', 'BillingRecord', {
            CreateBill: '_createRecord',
            UpdateBill: '_updateRecord',
            GetBill: '_getRecord',
            DeleteBill: '_deleteRecord',
            ListBills: '_listRecords',
            QueryBillByField: '_queryByField',
        });
    }
}

bindDynamicFunctions(BillingContract, {
    CreateBill: '_createRecord',
    UpdateBill: '_updateRecord',
    GetBill: '_getRecord',
    DeleteBill: '_deleteRecord',
    ListBills: '_listRecords',
    QueryBillByField: '_queryByField',
});

module.exports = BillingContract;
