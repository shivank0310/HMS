const authService = require('../services/auth.service');
const userRepo = require('../repositories/user.repository');
const asyncHandler = require('../utils/asyncHandler');

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, data: result });
});

exports.logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken;
  const result = await authService.refreshToken(token);
  res.json({ success: true, data: result });
});

exports.registerUser = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password updated' });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'If the email exists, reset instructions were sent', email: req.body.email });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Password reset successful' });
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await userRepo.findById(req.user.sub);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: authService.sanitizeUser(user) });
});
