const insuranceService = require('../services/insurance.service');
const asyncHandler = require('../utils/asyncHandler');

exports.submitClaim = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await insuranceService.submitClaim(req.body) });
});

exports.approve = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await insuranceService.approve(req.params.id || req.body.claimId) });
});

exports.reject = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await insuranceService.reject(req.params.id || req.body.claimId, req.body.reason) });
});

exports.history = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await insuranceService.history(req.query.patientId) });
});

exports.policy = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await insuranceService.getPolicy(req.params.patientId || req.query.patientId) });
});

exports.payment = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await insuranceService.getPaymentHistory(req.query.patientId) });
});
