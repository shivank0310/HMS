const billingService = require('../services/billing.service');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const data = await billingService.create(req.body, req.user?.mspId);
  res.status(201).json({ success: true, data });
});

exports.list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await billingService.list() });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.getById(req.params.id) });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await billingService.update(req.params.id, req.body, req.user?.mspId);
  res.json({ success: true, data });
});

exports.payment = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.recordPayment(req.params.id || req.body.billingId, req.body) });
});

exports.invoice = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.getInvoice(req.params.id || req.query.billingId) });
});

exports.download = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoice(req.params.id || req.query.billingId);
  res.json({ success: true, data: invoice, downloadUrl: `/billing/invoice?id=${invoice.id}` });
});
