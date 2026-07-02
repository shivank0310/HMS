const { User } = require('../models');
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }
}

module.exports = new UserRepository();
