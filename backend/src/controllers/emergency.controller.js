const emergencyService = require('../services/emergency.service');
const asyncHandler = require('../utils/asyncHandler');

exports.access = asyncHandler(async (req, res) => {
  const data = await emergencyService.grantAccess(req.body, req.user?.mspId);
  res.status(201).json({ success: true, data });
});

exports.close = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await emergencyService.closeAccess(req.params.id || req.body.accessId, req.user?.mspId) });
});

exports.history = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await emergencyService.history() });
});

exports.current = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await emergencyService.current() });
});
