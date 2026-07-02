const { InsuranceClaim } = require('../models');
const BaseRepository = require('./base.repository');

class InsuranceRepository extends BaseRepository {
  constructor() {
    super(InsuranceClaim);
  }
}

module.exports = new InsuranceRepository();
