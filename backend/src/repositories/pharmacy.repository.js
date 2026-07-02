const { PharmacyInventory, PharmacyDispense } = require('../models');
const BaseRepository = require('./base.repository');

class PharmacyRepository extends BaseRepository {
  constructor() {
    super(PharmacyInventory);
    this.Dispense = PharmacyDispense;
  }

  listDispenses(filter = {}) {
    return this.Dispense.find(filter).sort({ createdAt: -1 }).lean();
  }

  async createDispense(data) {
    const doc = await this.Dispense.create(data);
    return doc.toObject();
  }
}

module.exports = new PharmacyRepository();
