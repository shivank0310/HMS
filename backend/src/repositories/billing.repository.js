const { BillingRecord } = require('../models');
const BaseRepository = require('./base.repository');

class BillingRepository extends BaseRepository {
  constructor() {
    super(BillingRecord);
  }
}

module.exports = new BillingRepository();
