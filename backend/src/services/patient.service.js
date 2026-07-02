const patientRepo = require('../repositories/patient.repository');
const treatmentRepo = require('../repositories/treatment.repository');
const diagnosisRepo = require('../repositories/diagnosis.repository');
const pharmacyRepo = require('../repositories/pharmacy.repository');
const { documentRepo, sharedRecordRepo } = require('../repositories/misc.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function createPatient(data, mspId = 'HospitalAdminMSP') {
  const id = data.id || generateId('pat');
  const record = {
    id,
    userId: data.userId || null,
    mrn: data.mrn || `MRN-${Date.now()}`,
    fullName: data.fullName || data.full_name,
    dateOfBirth: data.dateOfBirth || data.date_of_birth || null,
    gender: data.gender || null,
    bloodGroup: data.bloodGroup || data.blood_group || null,
    contactEmail: data.contactEmail || data.contact_email || null,
    contactPhone: data.contactPhone || data.contact_phone || null,
    address: data.address || null,
    allergies: data.allergies || [],
    emergencyContact: data.emergencyContact || null,
    metadata: data.metadata || undefined,
    status: 'active',
  };

  const sync = await syncService.syncToChain('patient', mspId, record);
  const saved = await patientRepo.insert({ ...record, blockchain: sync.blockchain });
  return saved;
}

async function listPatients() {
  return patientRepo.findAll();
}

async function getPatient(id) {
  const patient = await patientRepo.findById(id);
  if (!patient) throw new ApiError('Patient not found', 404);
  return patient;
}

async function updatePatient(id, data, mspId) {
  const existing = await getPatient(id);
  const updated = {
    ...existing,
    fullName: data.fullName ?? data.full_name ?? existing.fullName,
    dateOfBirth: data.dateOfBirth ?? data.date_of_birth ?? existing.dateOfBirth,
    gender: data.gender ?? existing.gender,
    bloodGroup: data.bloodGroup ?? data.blood_group ?? existing.bloodGroup,
    contactEmail: data.contactEmail ?? data.contact_email ?? existing.contactEmail,
    contactPhone: data.contactPhone ?? data.contact_phone ?? existing.contactPhone,
    address: data.address ?? existing.address,
    allergies: data.allergies ?? existing.allergies,
    metadata: { ...(existing.metadata || {}), ...(data.metadata || {}), ...data },
  };

  const sync = await syncService.syncToChain('patient', mspId || 'HospitalAdminMSP', updated, 'update');
  return patientRepo.update(id, {
    fullName: updated.fullName,
    dateOfBirth: updated.dateOfBirth,
    gender: updated.gender,
    bloodGroup: updated.bloodGroup,
    contactEmail: updated.contactEmail,
    contactPhone: updated.contactPhone,
    address: updated.address,
    allergies: updated.allergies,
    metadata: updated.metadata,
    blockchain: sync.blockchain,
  });
}

async function deletePatient(id, mspId) {
  await getPatient(id);
  await patientRepo.delete(id);
  try {
    const contract = await require('../blockchain/fabricGateway').getContract('patientchannel', 'patientcc', mspId || 'HospitalAdminMSP');
    await contract.submitTransaction('DeletePatient', id);
  } catch {
    // non-blocking
  }
}

async function getMedicalHistory(patientId) {
  await getPatient(patientId);
  const [treatments, diagnoses, prescriptions] = await Promise.all([
    treatmentRepo.findAll({ patientId }),
    diagnosisRepo.findAll({ patientId }),
    pharmacyRepo.listDispenses({ patientId }),
  ]);
  return { treatments, diagnoses, prescriptions };
}

async function shareRecord(data) {
  return sharedRecordRepo.insert({
    id: generateId('share'),
    patientId: data.patientId,
    sharedWith: data.sharedWith,
    recordType: data.recordType,
    recordId: data.recordId,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  });
}

async function revokeShare(id) {
  return sharedRecordRepo.delete(id);
}

async function saveDocument(patientId, file, metadata = {}) {
  await getPatient(patientId);
  return documentRepo.insert({
    id: generateId('doc'),
    patientId,
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    metadata,
  });
}

async function getPatientWithChainVerification(id, mspId) {
  const patient = await getPatient(id);
  const verification = await syncService.verifyIntegrity('patient', mspId || 'HospitalAdminMSP', patient);
  return { ...patient, chainVerification: verification };
}

module.exports = {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getMedicalHistory,
  shareRecord,
  revokeShare,
  saveDocument,
  getPatientWithChainVerification,
};
