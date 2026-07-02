const diagnosisRepo = require('../repositories/diagnosis.repository');
const auditService = require('./audit.service');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function create(type, data, mspId = 'DiagnosticStaffMSP') {
  const id = generateId('dx');
  const record = await diagnosisRepo.insert({
    id,
    patientId: data.patientId,
    type,
    reportUrl: data.reportUrl || null,
    findings: data.findings || null,
    status: 'pending',
    metadata: data.metadata || {},
    blockchain: { synced: false, note: 'Diagnosis stored off-chain in MongoDB' },
  });

  await auditService.log({
    userId: data.userId,
    mspId,
    action: 'diagnosis.created',
    resource: 'diagnosis',
    resourceId: id,
    metadata: { patientId: data.patientId, type },
  });

  return record;
}

async function listHistory(patientId) {
  if (patientId) return diagnosisRepo.findAll({ patientId });
  return diagnosisRepo.findAll();
}

async function approve(id) {
  const item = await diagnosisRepo.findById(id);
  if (!item) throw new ApiError('Diagnosis not found', 404);
  return diagnosisRepo.update(id, { status: 'approved' });
}

async function cancel(id) {
  await diagnosisRepo.delete(id);
}

module.exports = { create, listHistory, approve, cancel };
