class BaseRepository {
  constructor(Model) {
    this.Model = Model;
  }

  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return this.Model.find(filter).sort(sort).lean();
  }

  async findById(id) {
    return this.Model.findOne({ id }).lean();
  }

  async findOne(filter) {
    return this.Model.findOne(filter).lean();
  }

  async insert(data) {
    const doc = await this.Model.create(data);
    return doc.toObject();
  }

  async update(id, data) {
    return this.Model.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean();
  }

  async delete(id) {
    return this.Model.deleteOne({ id });
  }

  async count(filter = {}) {
    return this.Model.countDocuments(filter);
  }

  async aggregate(pipeline) {
    return this.Model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
