const consentService = require('../services/consent.service');
const asyncHandler = require('../utils/asyncHandler');

exports.grant = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await consentService.grant(req.body) });
});

exports.revoke = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await consentService.revoke(req.params.id || req.body.consentId) });
});

exports.list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await consentService.list(req.query.patientId) });
});

exports.history = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await consentService.history(req.query.patientId) });
});

exports.emergency = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await consentService.emergencyGrant(req.body) });
});
