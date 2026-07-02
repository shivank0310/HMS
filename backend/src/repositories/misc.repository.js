const {
  Document,
  SharedRecord,
  Doctor,
  RefreshToken,
  AiRequest,
} = require('../models');
const BaseRepository = require('./base.repository');

class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document);
  }
}

class SharedRecordRepository extends BaseRepository {
  constructor() {
    super(SharedRecord);
  }
}

class DoctorRepository extends BaseRepository {
  constructor() {
    super(Doctor);
  }
}

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }
}

class AiRequestRepository extends BaseRepository {
  constructor() {
    super(AiRequest);
  }

  findByUser(userId) {
    const filter = userId ? { userId } : {};
    return this.findAll(filter);
  }
}

module.exports = {
  documentRepo: new DocumentRepository(),
  sharedRecordRepo: new SharedRecordRepository(),
  doctorRepo: new DoctorRepository(),
  refreshTokenRepo: new RefreshTokenRepository(),
  aiRequestRepo: new AiRequestRepository(),
};
