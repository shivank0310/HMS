const pharmacyRepo = require('../repositories/pharmacy.repository');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function listInventory() {
  return pharmacyRepo.findAll();
}

async function addInventory(data) {
  return pharmacyRepo.insert({
    id: generateId('inv'),
    drugName: data.drugName,
    sku: data.sku || generateId('sku'),
    quantity: data.quantity || 0,
    unit: data.unit || 'units',
    expiryDate: data.expiryDate || null,
    metadata: data.metadata || {},
  });
}

async function updateInventory(id, data) {
  const item = await pharmacyRepo.findById(id);
  if (!item) throw new ApiError('Inventory item not found', 404);
  return pharmacyRepo.update(id, {
    drugName: data.drugName ?? item.drugName,
    quantity: data.quantity ?? item.quantity,
    unit: data.unit ?? item.unit,
    expiryDate: data.expiryDate ?? item.expiryDate,
    metadata: data.metadata ?? item.metadata,
  });
}

async function deleteInventory(id) {
  await pharmacyRepo.delete(id);
}

async function listPrescriptions() {
  return pharmacyRepo.listDispenses();
}

async function dispense(data, mspId = 'PharmacyServicesMSP') {
  const id = generateId('dsp');
  const record = {
    id,
    patientId: data.patientId,
    prescriptionId: data.prescriptionId || null,
    drugName: data.drugName,
    quantity: data.quantity,
    status: 'dispensed',
    metadata: data.metadata || {},
  };

  const sync = await syncService.syncToChain('pharmacy', mspId, record);
  return pharmacyRepo.createDispense({ ...record, blockchain: sync.blockchain });
}

async function returnDrug(dispenseId) {
  return pharmacyRepo.createDispense({
    id: generateId('ret'),
    patientId: dispenseId,
    drugName: 'return',
    quantity: 0,
    status: 'returned',
    metadata: { originalId: dispenseId },
  });
}

async function history() {
  return pharmacyRepo.listDispenses();
}

module.exports = {
  listInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  listPrescriptions,
  dispense,
  returnDrug,
  history,
};
