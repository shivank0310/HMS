const appointmentRepo = require('../repositories/appointment.repository');
const auditRepo = require('../repositories/audit.repository');
const billingRepo = require('../repositories/billing.repository');
const diagnosisRepo = require('../repositories/diagnosis.repository');
const emergencyRepo = require('../repositories/emergency.repository');
const insuranceRepo = require('../repositories/insurance.repository');
const patientRepo = require('../repositories/patient.repository');
const pharmacyRepo = require('../repositories/pharmacy.repository');
const treatmentRepo = require('../repositories/treatment.repository');
const { doctorRepo } = require('../repositories/misc.repository');
const fabricService = require('../blockchain/fabricService');
const { CHANNELS } = require('../config/fabric');
const { ROLES } = require('../utils/roles');

const MAX_RECENT_ITEMS = 6;

function takeRecent(items = [], count = MAX_RECENT_ITEMS) {
  return Array.isArray(items) ? items.slice(0, count) : [];
}

function countByStatus(items = [], status) {
  return items.filter((item) => String(item.status || '').toLowerCase() === status).length;
}

function countSynced(items = []) {
  return items.filter((item) => item.blockchain?.synced).length;
}

function countFailed(items = []) {
  return items.filter((item) => item.blockchain && item.blockchain.synced === false).length;
}

async function getChainModule(moduleKey, mspId, records = []) {
  const channel = CHANNELS[moduleKey];
  const onChainRecords = await fabricService.listRecords(moduleKey, mspId);

  return {
    module: moduleKey,
    channel: channel?.channelName || null,
    chaincode: channel?.chaincode || null,
    databaseCount: records.length,
    syncedCount: countSynced(records),
    failedCount: countFailed(records),
    onChainCount: Array.isArray(onChainRecords) ? onChainRecords.length : 0,
  };
}

async function getCollections() {
  const [
    patients,
    doctors,
    appointments,
    treatments,
    diagnoses,
    inventory,
    dispenses,
    bills,
    claims,
    emergencies,
    audits,
  ] = await Promise.all([
    patientRepo.findAll(),
    doctorRepo.findAll(),
    appointmentRepo.findAll(),
    treatmentRepo.findAll(),
    diagnosisRepo.findAll(),
    pharmacyRepo.findAll(),
    pharmacyRepo.listDispenses(),
    billingRepo.findAll(),
    insuranceRepo.findAll(),
    emergencyRepo.findAll(),
    auditRepo.search({}),
  ]);

  return {
    patients,
    doctors,
    appointments,
    treatments,
    diagnoses,
    inventory,
    dispenses,
    bills,
    claims,
    emergencies,
    audits,
  };
}

async function getBlockchainSummary(mspId, moduleRecords) {
  const modules = Object.entries(moduleRecords);
  const summaries = await Promise.all(
    modules.map(([moduleKey, records]) => getChainModule(moduleKey, mspId, records))
  );

  return {
    modules: summaries,
    note: 'Insurance claims, appointments, consent, and diagnosis records are stored off-chain unless their related billing/treatment records are synced.',
  };
}

function buildAdminDashboard(data) {
  return {
    metrics: {
      patients: data.patients.length,
      doctors: data.doctors.length,
      appointments: data.appointments.length,
      activeTreatments: countByStatus(data.treatments, 'active'),
      pendingBills: countByStatus(data.bills, 'pending'),
      paidBills: countByStatus(data.bills, 'paid'),
      claims: data.claims.length,
      activeEmergencies: countByStatus(data.emergencies, 'active'),
      auditLogs: data.audits.length,
    },
    records: {
      patients: takeRecent(data.patients),
      appointments: takeRecent(data.appointments),
      treatments: takeRecent(data.treatments),
      bills: takeRecent(data.bills),
      claims: takeRecent(data.claims),
      emergencies: takeRecent(data.emergencies),
      audits: takeRecent(data.audits),
    },
    chainModules: {
      patient: data.patients,
      treatment: data.treatments,
      billing: data.bills,
      pharmacy: data.dispenses,
      emergency: data.emergencies,
      audit: data.audits,
    },
  };
}

function buildClinicalDashboard(data) {
  return {
    metrics: {
      patients: data.patients.length,
      appointments: data.appointments.length,
      activeTreatments: countByStatus(data.treatments, 'active'),
      diagnoses: data.diagnoses.length,
      prescriptions: data.dispenses.length,
      highRiskAlerts: countByStatus(data.emergencies, 'active'),
    },
    records: {
      patients: takeRecent(data.patients),
      appointments: takeRecent(data.appointments),
      treatments: takeRecent(data.treatments),
      diagnoses: takeRecent(data.diagnoses),
      prescriptions: takeRecent(data.dispenses),
      emergencies: takeRecent(data.emergencies),
    },
    chainModules: {
      patient: data.patients,
      treatment: data.treatments,
      pharmacy: data.dispenses,
      emergency: data.emergencies,
    },
  };
}

async function buildPatientDashboard(data, userId) {
  const patient = await patientRepo.findOne({ userId });
  const patientId = patient?.id;
  const filterByPatient = (items) => (patientId ? items.filter((item) => item.patientId === patientId) : items);

  const appointments = filterByPatient(data.appointments);
  const treatments = filterByPatient(data.treatments);
  const diagnoses = filterByPatient(data.diagnoses);
  const prescriptions = filterByPatient(data.dispenses);
  const bills = filterByPatient(data.bills);
  const emergencies = filterByPatient(data.emergencies);
  const patients = patient ? [patient] : takeRecent(data.patients, 1);

  return {
    metrics: {
      patientName: patient?.fullName || patients[0]?.fullName || 'Patient',
      appointments: appointments.length,
      activeTreatments: countByStatus(treatments, 'active'),
      diagnoses: diagnoses.length,
      prescriptions: prescriptions.length,
      pendingBills: countByStatus(bills, 'pending'),
      activeEmergencies: countByStatus(emergencies, 'active'),
    },
    records: {
      patients,
      appointments: takeRecent(appointments),
      treatments: takeRecent(treatments),
      diagnoses: takeRecent(diagnoses),
      prescriptions: takeRecent(prescriptions),
      bills: takeRecent(bills),
      emergencies: takeRecent(emergencies),
    },
    chainModules: {
      patient: patients,
      treatment: treatments,
      billing: bills,
      pharmacy: prescriptions,
      emergency: emergencies,
    },
  };
}

function buildInsuranceDashboard(data) {
  return {
    metrics: {
      claims: data.claims.length,
      approvedClaims: countByStatus(data.claims, 'approved'),
      pendingClaims: countByStatus(data.claims, 'submitted') + countByStatus(data.claims, 'under_review'),
      rejectedClaims: countByStatus(data.claims, 'rejected'),
      bills: data.bills.length,
      pendingBills: countByStatus(data.bills, 'pending'),
    },
    records: {
      claims: takeRecent(data.claims),
      bills: takeRecent(data.bills),
      patients: takeRecent(data.patients),
    },
    chainModules: {
      billing: data.bills,
      audit: data.audits,
    },
  };
}

function buildPharmacyDashboard(data) {
  return {
    metrics: {
      inventory: data.inventory.length,
      lowStock: data.inventory.filter((item) => Number(item.quantity || 0) <= 100).length,
      dispenses: data.dispenses.length,
      pendingBills: countByStatus(data.bills, 'pending'),
      paidBills: countByStatus(data.bills, 'paid'),
      expiringSoon: data.inventory.filter((item) => {
        if (!item.expiryDate) return false;
        const days = (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      }).length,
    },
    records: {
      inventory: takeRecent(data.inventory),
      prescriptions: takeRecent(data.dispenses),
      bills: takeRecent(data.bills),
      patients: takeRecent(data.patients),
    },
    chainModules: {
      pharmacy: data.dispenses,
      billing: data.bills,
    },
  };
}

async function getRoleDashboard(user) {
  const role = user.role;
  const mspId = user.mspId;
  const data = await getCollections();

  let dashboard;
  if (role === ROLES.HOSPITAL_ADMIN) {
    dashboard = buildAdminDashboard(data);
  } else if (role === ROLES.PATIENT) {
    dashboard = await buildPatientDashboard(data, user.id);
  } else if (role === ROLES.INSURANCE) {
    dashboard = buildInsuranceDashboard(data);
  } else if (role === ROLES.PHARMACIST) {
    dashboard = buildPharmacyDashboard(data);
  } else {
    dashboard = buildClinicalDashboard(data);
  }

  return {
    role,
    mspId,
    generatedAt: new Date().toISOString(),
    metrics: dashboard.metrics,
    records: dashboard.records,
    blockchain: await getBlockchainSummary(mspId, dashboard.chainModules),
  };
}

module.exports = {
  getRoleDashboard,
};
