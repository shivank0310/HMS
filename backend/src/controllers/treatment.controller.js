const treatmentService = require('../services/treatment.service');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const data = await treatmentService.create(req.body, req.user?.mspId);
  res.status(201).json({ success: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await treatmentService.update(req.params.id, req.body, req.user?.mspId);
  res.json({ success: true, data });
});

exports.list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await treatmentService.list() });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await treatmentService.getById(req.params.id) });
});

exports.addNotes = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await treatmentService.addNotes(req.params.id, req.body.notes) });
});

exports.addVitals = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await treatmentService.addVitals(req.params.id, req.body.vitals) });
});

exports.discharge = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await treatmentService.discharge(req.params.id, req.user?.mspId) });
});

exports.refer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await treatmentService.refer(req.params.id, req.body) });
});
