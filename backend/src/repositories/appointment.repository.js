const { Appointment } = require('../models');
const BaseRepository = require('./base.repository');

class AppointmentRepository extends BaseRepository {
  constructor() {
    super(Appointment);
  }
}

module.exports = new AppointmentRepository();
