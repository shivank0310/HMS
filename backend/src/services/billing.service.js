const billingRepo = require('../repositories/billing.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function create(data, mspId = 'HospitalAdminMSP') {
  const id = generateId('bill');
  const record = {
    id,
    patientId: data.patientId,
    amount: data.amount,
    currency: data.currency || 'INR',
    status: 'pending',
    invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
    lineItems: data.lineItems || [],
    metadata: data.metadata || {},
  };

  const sync = await syncService.syncToChain('billing', mspId, record);
  return billingRepo.insert({ ...record, blockchain: sync.blockchain });
}

async function list() {
  return billingRepo.findAll();
}

async function getById(id) {
  const item = await billingRepo.findById(id);
  if (!item) throw new ApiError('Billing record not found', 404);
  return item;
}

async function update(id, data, mspId) {
  const existing = await getById(id);
  const merged = {
    ...existing,
    amount: data.amount ?? existing.amount,
    status: data.status ?? existing.status,
    lineItems: data.lineItems ?? existing.lineItems,
    metadata: { ...(existing.metadata || {}), ...(data.metadata || {}), ...data },
  };

  const sync = await syncService.syncToChain('billing', mspId || 'HospitalAdminMSP', merged, 'update');
  return billingRepo.update(id, {
    amount: merged.amount,
    status: merged.status,
    lineItems: merged.lineItems,
    metadata: merged.metadata,
    blockchain: sync.blockchain,
  });
}

async function recordPayment(id, payment) {
  const existing = await getById(id);
  return billingRepo.update(id, {
    status: 'paid',
    metadata: { ...(existing.metadata || {}), payment },
  });
}

async function getInvoice(id) {
  return getById(id);
}

module.exports = { create, list, getById, update, recordPayment, getInvoice };
