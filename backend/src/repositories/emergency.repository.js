const { EmergencyAccess } = require('../models');
const BaseRepository = require('./base.repository');

class EmergencyRepository extends BaseRepository {
  constructor() {
    super(EmergencyAccess);
  }

  findActive() {
    return this.findAll({ status: 'active' });
  }
}

module.exports = new EmergencyRepository();
