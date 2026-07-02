const pharmacyService = require('../services/pharmacy.service');
const asyncHandler = require('../utils/asyncHandler');

exports.inventoryList = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await pharmacyService.listInventory() });
});

exports.inventoryCreate = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await pharmacyService.addInventory(req.body) });
});

exports.inventoryUpdate = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await pharmacyService.updateInventory(req.params.id, req.body) });
});

exports.inventoryDelete = asyncHandler(async (req, res) => {
  await pharmacyService.deleteInventory(req.params.id);
  res.json({ success: true, message: 'Inventory item deleted' });
});

exports.prescriptions = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await pharmacyService.listPrescriptions() });
});

exports.dispense = asyncHandler(async (req, res) => {
  const data = await pharmacyService.dispense(req.body, req.user?.mspId);
  res.status(201).json({ success: true, data });
});

exports.returnDrug = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await pharmacyService.returnDrug(req.body.dispenseId || req.params.id) });
});

exports.history = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await pharmacyService.history() });
});
