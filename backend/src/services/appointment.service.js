const appointmentRepo = require('../repositories/appointment.repository');
const auditService = require('./audit.service');
const treatmentService = require('./treatment.service');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function create(data, mspId = 'PatientAccessMSP', userId = null) {
  const record = {
    id: generateId('apt'),
    patientId: data.patientId,
    doctorId: data.doctorId || null,
    scheduledAt: new Date(data.scheduledAt),
    status: 'scheduled',
    reason: data.reason || null,
    notes: data.notes || null,
    metadata: data.metadata || {},
  };

  const created = await appointmentRepo.insert(record);
  await auditService.log({
    userId,
    mspId,
    action: 'appointment.created',
    resource: 'appointment',
    resourceId: created.id,
    metadata: {
      patientId: created.patientId,
      doctorId: created.doctorId,
      scheduledAt: created.scheduledAt,
      reason: created.reason,
    },
  });

  return created;
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

async function update(id, data, mspId = 'PatientAccessMSP', userId = null) {
  await getById(id);
  const updated = await appointmentRepo.update(id, {
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    doctorId: data.doctorId,
    status: data.status,
    reason: data.reason,
    notes: data.notes,
    metadata: data.metadata,
  });
  await auditService.log({
    userId,
    mspId,
    action: 'appointment.updated',
    resource: 'appointment',
    resourceId: id,
    metadata: { ...data },
  });
  return updated;
}

async function accept(id, mspId = 'ClinicalStaffMSP', userId = null) {
  const appointment = await getById(id);
  if (String(appointment.status || '').toLowerCase() === 'accepted') {
    return {
      appointment,
      treatment: null,
      suggestion: appointment.metadata?.suggestion || null,
    };
  }

  const updatedAppointment = await appointmentRepo.update(id, {
    status: 'accepted',
    metadata: {
      ...(appointment.metadata || {}),
      acceptedAt: new Date().toISOString(),
      acceptedBy: userId || null,
    },
  });

  const treatment = await treatmentService.create(
    {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId || null,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      metadata: {
        sourceAppointmentId: appointment.id,
        sourceAppointmentStatus: 'accepted',
      },
      userId,
    },
    mspId,
    {
      status: 'planned',
    }
  );

  await auditService.log({
    userId,
    mspId,
    action: 'appointment.accepted',
    resource: 'appointment',
    resourceId: id,
    metadata: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      treatmentId: treatment.id,
    },
  });

  return {
    appointment: updatedAppointment,
    treatment,
    suggestion: treatment.metadata?.suggestion || null,
  };
}

async function remove(id, mspId = 'PatientAccessMSP', userId = null) {
  await getById(id);
  await appointmentRepo.delete(id);
  await auditService.log({
    userId,
    mspId,
    action: 'appointment.deleted',
    resource: 'appointment',
    resourceId: id,
  });
}

async function checkIn(id, mspId = 'PatientAccessMSP', userId = null) {
  await getById(id);
  const updated = await appointmentRepo.update(id, { status: 'checked_in', checkedInAt: new Date() });
  await auditService.log({
    userId,
    mspId,
    action: 'appointment.checked_in',
    resource: 'appointment',
    resourceId: id,
  });
  return updated;
}

async function checkOut(id, mspId = 'PatientAccessMSP', userId = null) {
  await getById(id);
  const updated = await appointmentRepo.update(id, { status: 'completed', checkedOutAt: new Date() });
  await auditService.log({
    userId,
    mspId,
    action: 'appointment.checked_out',
    resource: 'appointment',
    resourceId: id,
  });
  return updated;
}

module.exports = { create, list, getById, update, accept, remove, checkIn, checkOut };
