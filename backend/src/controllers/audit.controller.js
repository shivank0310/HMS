const auditService = require('../services/audit.service');
const asyncHandler = require('../utils/asyncHandler');

exports.logs = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await auditService.list(req.query) });
});

exports.history = exports.logs;

exports.patient = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await auditService.list({ patientId: req.params.patientId || req.query.patientId }) });
});

exports.download = asyncHandler(async (req, res) => {
  const data = await auditService.list(req.query);
  res.json({ success: true, data, format: 'json' });
});

exports.exportData = asyncHandler(async (req, res) => {
  const data = await auditService.list(req.query);
  res.setHeader('Content-Disposition', 'attachment; filename=audit-export.json');
  res.json({ success: true, exportedAt: new Date().toISOString(), count: data.length, data });
});
