const emergencyRepo = require('../repositories/emergency.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function grantAccess(data, mspId = 'ClinicalStaffMSP') {
  const id = generateId('emg');
  const record = {
    id,
    patientId: data.patientId,
    grantedBy: data.grantedBy || null,
    reason: data.reason || null,
    status: 'active',
    metadata: data.metadata || {},
  };

  const sync = await syncService.syncToChain('emergency', mspId, record);
  return emergencyRepo.insert({ ...record, blockchain: sync.blockchain });
}

async function closeAccess(id, mspId) {
  const item = await emergencyRepo.findById(id);
  if (!item) throw new ApiError('Emergency access not found', 404);
  const merged = { ...item, status: 'closed' };
  const sync = await syncService.syncToChain('emergency', mspId || 'ClinicalStaffMSP', merged, 'update');
  return emergencyRepo.update(id, { status: 'closed', closedAt: new Date(), blockchain: sync.blockchain });
}

async function history() {
  return emergencyRepo.findAll();
}

async function current() {
  return emergencyRepo.findActive();
}

module.exports = { grantAccess, closeAccess, history, current };
