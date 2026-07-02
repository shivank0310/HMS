const treatmentRepo = require('../repositories/treatment.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function create(data, mspId = 'ClinicalStaffMSP') {
  const id = generateId('trt');
  const record = {
    id,
    patientId: data.patientId,
    doctorId: data.doctorId || null,
    diagnosis: data.diagnosis || null,
    status: 'active',
    notes: data.notes || null,
    vitals: data.vitals || {},
    metadata: data.metadata || {},
  };

  const sync = await syncService.syncToChain('treatment', mspId, record);
  return treatmentRepo.insert({ ...record, blockchain: sync.blockchain });
}

async function list() {
  return treatmentRepo.findAll();
}

async function getById(id) {
  const item = await treatmentRepo.findById(id);
  if (!item) throw new ApiError('Treatment not found', 404);
  return item;
}

async function update(id, data, mspId) {
  const existing = await getById(id);
  const merged = {
    ...existing,
    diagnosis: data.diagnosis ?? existing.diagnosis,
    status: data.status ?? existing.status,
    notes: data.notes ?? existing.notes,
    vitals: data.vitals ?? existing.vitals,
    metadata: { ...(existing.metadata || {}), ...(data.metadata || {}), ...data },
  };

  const sync = await syncService.syncToChain('treatment', mspId || 'ClinicalStaffMSP', merged, 'update');
  return treatmentRepo.update(id, {
    diagnosis: merged.diagnosis,
    status: merged.status,
    notes: merged.notes,
    vitals: merged.vitals,
    metadata: merged.metadata,
    blockchain: sync.blockchain,
  });
}

async function addNotes(id, notes) {
  const existing = await getById(id);
  return treatmentRepo.update(id, { notes: `${existing.notes || ''}\n${notes}`.trim() });
}

async function addVitals(id, vitals) {
  await getById(id);
  return treatmentRepo.update(id, { vitals });
}

async function discharge(id, mspId) {
  const existing = await getById(id);
  const merged = { ...existing, status: 'discharged' };
  const sync = await syncService.syncToChain('treatment', mspId || 'ClinicalStaffMSP', merged, 'update');
  return treatmentRepo.update(id, { status: 'discharged', blockchain: sync.blockchain });
}

async function refer(id, referral) {
  const existing = await getById(id);
  return treatmentRepo.update(id, {
    metadata: { ...(existing.metadata || {}), referral },
    status: 'referred',
  });
}

module.exports = { create, list, getById, update, addNotes, addVitals, discharge, refer };
