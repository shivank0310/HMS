const patientService = require('../services/patient.service');
const appointmentService = require('../services/appointment.service');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await patientService.listPatients() });
});

exports.getById = asyncHandler(async (req, res) => {
  const data = req.query.verify === 'true'
    ? await patientService.getPatientWithChainVerification(req.params.id, req.user?.mspId)
    : await patientService.getPatient(req.params.id);
  res.json({ success: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await patientService.updatePatient(req.params.id, req.body, req.user.mspId);
  res.json({ success: true, data });
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const patientId = req.body.patientId || req.params.id;
  const data = await patientService.saveDocument(patientId, req.file, req.body);
  res.status(201).json({ success: true, data });
});

exports.history = asyncHandler(async (req, res) => {
  const patientId = req.params.id || req.query.patientId;
  res.json({ success: true, data: await patientService.getMedicalHistory(patientId) });
});

exports.shareRecord = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await patientService.shareRecord(req.body) });
});

exports.revokeShare = asyncHandler(async (req, res) => {
  await patientService.revokeShare(req.params.id || req.body.shareId);
  res.json({ success: true, message: 'Share revoked' });
});

exports.medicalHistory = exports.history;

exports.appointments = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await appointmentService.list({ patientId: req.params.id || req.query.patientId }),
  });
});

exports.prescriptions = asyncHandler(async (req, res) => {
  const patientId = req.params.id || req.query.patientId;
  const history = await patientService.getMedicalHistory(patientId);
  res.json({ success: true, data: history.prescriptions });
});
