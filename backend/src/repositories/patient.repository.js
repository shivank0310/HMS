const { Patient } = require('../models');
const BaseRepository = require('./base.repository');

class PatientRepository extends BaseRepository {
  constructor() {
    super(Patient);
  }
}

module.exports = new PatientRepository();
