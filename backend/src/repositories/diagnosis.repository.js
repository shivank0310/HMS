const { Diagnosis } = require('../models');
const BaseRepository = require('./base.repository');

class DiagnosisRepository extends BaseRepository {
  constructor() {
    super(Diagnosis);
  }
}

module.exports = new DiagnosisRepository();
