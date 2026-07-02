const appointmentRepo = require('../repositories/appointment.repository');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function create(data) {
  return appointmentRepo.insert({
    id: generateId('apt'),
    patientId: data.patientId,
    doctorId: data.doctorId || null,
    scheduledAt: new Date(data.scheduledAt),
    status: 'scheduled',
    reason: data.reason || null,
    notes: data.notes || null,
    metadata: data.metadata || {},
  });
}

async function list(filters = {}) {
  if (filters.patientId) return appointmentRepo.findAll({ patientId: filters.patientId });
  return appointmentRepo.findAll();
}

async function getById(id) {
  const item = await appointmentRepo.findById(id);
  if (!item) throw new ApiError('Appointment not found', 404);
  return item;
}

async function update(id, data) {
  await getById(id);
  return appointmentRepo.update(id, {
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    doctorId: data.doctorId,
    status: data.status,
    reason: data.reason,
    notes: data.notes,
    metadata: data.metadata,
  });
}

async function remove(id) {
  await getById(id);
  await appointmentRepo.delete(id);
}

async function checkIn(id) {
  await getById(id);
  return appointmentRepo.update(id, { status: 'checked_in', checkedInAt: new Date() });
}

async function checkOut(id) {
  await getById(id);
  return appointmentRepo.update(id, { status: 'completed', checkedOutAt: new Date() });
}

module.exports = { create, list, getById, update, remove, checkIn, checkOut };
