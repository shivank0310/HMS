const { Treatment } = require('../models');
const BaseRepository = require('./base.repository');

class TreatmentRepository extends BaseRepository {
  constructor() {
    super(Treatment);
  }
}

module.exports = new TreatmentRepository();
