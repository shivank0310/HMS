const auditRepo = require('../repositories/audit.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');

async function log(entry) {
  const id = generateId('audit');
  const record = {
    id,
    userId: entry.userId || null,
    action: entry.action,
    resource: entry.resource || null,
    resourceId: entry.resourceId || null,
    mspId: entry.mspId || 'HospitalAdminMSP',
    ipAddress: entry.ipAddress || null,
    metadata: entry.metadata || {},
  };

  const sync = await syncService.syncToChain('audit', record.mspId, record);
  return auditRepo.insert({ ...record, blockchain: sync.blockchain });
}

async function list(filters) {
  return auditRepo.search(filters);
}

module.exports = { log, list };
