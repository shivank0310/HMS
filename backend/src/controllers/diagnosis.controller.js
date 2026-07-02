const diagnosisService = require('../services/diagnosis.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createLab = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await diagnosisService.create('lab', req.body, req.user?.mspId) });
});

exports.createRadiology = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await diagnosisService.create('radiology', req.body, req.user?.mspId) });
});

exports.uploadReport = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await diagnosisService.create(req.body.type || 'report', {
      ...req.body,
      reportUrl: req.file?.path,
    }, req.user?.mspId),
  });
});

exports.history = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await diagnosisService.listHistory(req.query.patientId) });
});

exports.approve = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await diagnosisService.approve(req.body.id || req.params.id) });
});

exports.cancel = asyncHandler(async (req, res) => {
  await diagnosisService.cancel(req.params.id || req.body.id);
  res.json({ success: true, message: 'Diagnosis cancelled' });
});
