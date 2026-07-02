const { Consent } = require('../models');
const BaseRepository = require('./base.repository');

class ConsentRepository extends BaseRepository {
  constructor() {
    super(Consent);
  }
}

module.exports = new ConsentRepository();
