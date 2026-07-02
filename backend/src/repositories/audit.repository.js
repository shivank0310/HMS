const { AuditLog } = require('../models');
const BaseRepository = require('./base.repository');

class AuditRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  search(filters = {}) {
    const query = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.resource) query.resource = filters.resource;
    if (filters.patientId) query['metadata.patientId'] = filters.patientId;
    return this.Model.find(query).sort({ createdAt: -1 }).limit(500).lean();
  }
}

module.exports = new AuditRepository();
