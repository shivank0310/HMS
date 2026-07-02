const appointmentService = require('../services/appointment.service');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await appointmentService.create(req.body) });
});

exports.list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await appointmentService.list(req.query) });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await appointmentService.getById(req.params.id) });
});

exports.update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await appointmentService.update(req.params.id, req.body) });
});

exports.remove = asyncHandler(async (req, res) => {
  await appointmentService.remove(req.params.id);
  res.json({ success: true, message: 'Appointment deleted' });
});

exports.checkIn = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await appointmentService.checkIn(req.params.id || req.body.appointmentId) });
});

exports.checkOut = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await appointmentService.checkOut(req.params.id || req.body.appointmentId) });
});
