const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createPatient = asyncHandler(async (req, res) => {
  const data = await adminService.createPatient(req.body, req.user.mspId);
  res.status(201).json({ success: true, data });
});

exports.updatePatient = asyncHandler(async (req, res) => {
  const data = await adminService.updatePatient(req.params.id, req.body, req.user.mspId);
  res.json({ success: true, data });
});

exports.deletePatient = asyncHandler(async (req, res) => {
  await adminService.deletePatient(req.params.id, req.user.mspId);
  res.json({ success: true, message: 'Patient deleted' });
});

exports.registerDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.registerStaff({ ...req.body, type: 'doctor' });
  res.status(201).json({ success: true, data });
});

exports.registerLabStaff = asyncHandler(async (req, res) => {
  const data = await adminService.registerStaff({ ...req.body, type: 'labstaff' });
  res.status(201).json({ success: true, data });
});

exports.registerPharmacist = asyncHandler(async (req, res) => {
  const data = await adminService.registerStaff({ ...req.body, type: 'pharmacist' });
  res.status(201).json({ success: true, data });
});

exports.registerInsurance = asyncHandler(async (req, res) => {
  const data = await adminService.registerStaff({ ...req.body, type: 'insurance' });
  res.status(201).json({ success: true, data });
});

exports.dashboard = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminService.getDashboardStats() });
});

exports.statistics = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminService.getStatistics() });
});
