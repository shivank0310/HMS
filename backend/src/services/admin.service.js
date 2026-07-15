const patientRepo = require('../repositories/patient.repository');
const appointmentRepo = require('../repositories/appointment.repository');
const treatmentRepo = require('../repositories/treatment.repository');
const billingRepo = require('../repositories/billing.repository');
const insuranceRepo = require('../repositories/insurance.repository');
const pharmacyRepo = require('../repositories/pharmacy.repository');
const { doctorRepo } = require('../repositories/misc.repository');
const patientService = require('./patient.service');
const authService = require('./auth.service');
const auditService = require('./audit.service');
const { generateId } = require('../utils/id');
const { ROLES } = require('../utils/roles');

async function getDashboardStats() {
  const [patients, appointments, treatments, billingPending] = await Promise.all([
    patientRepo.count(),
    appointmentRepo.count({ status: 'scheduled' }),
    treatmentRepo.count({ status: 'active' }),
    billingRepo.count({ status: 'pending' }),
  ]);
  return { patients, appointments, treatments, billingPending };
}

async function getStatistics() {
  const stats = await getDashboardStats();
  const claims = await insuranceRepo.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const dispenses = await pharmacyRepo.listDispenses();
  return { ...stats, insuranceClaims: claims, pharmacyDispenses: dispenses.length };
}

async function registerStaff(payload) {
  const roleMap = {
    doctor: ROLES.DOCTOR,
    labstaff: ROLES.LAB_STAFF,
    pharmacist: ROLES.PHARMACIST,
    insurance: ROLES.INSURANCE,
  };
  const role = roleMap[payload.type] || ROLES.CLINICAL_STAFF;
  const user = await authService.registerUser({ ...payload, role });

  if (payload.type === 'doctor') {
    const doctor = await doctorRepo.insert({
      id: generateId('doc'),
      userId: user.id,
      specialization: payload.specialization || null,
      licenseNumber: payload.licenseNumber || null,
      department: payload.department || null,
      metadata: payload.metadata || {},
    });
    await auditService.log({
      userId: user.id,
      mspId: user.mspId || 'HospitalAdminMSP',
      action: 'doctor.registered',
      resource: 'doctor',
      resourceId: doctor.id,
      metadata: {
        department: doctor.department,
        specialization: doctor.specialization,
      },
    });
    return { user, doctor };
  }

  return user;
}

module.exports = {
  getDashboardStats,
  getStatistics,
  registerStaff,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,
};
