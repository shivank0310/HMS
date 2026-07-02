const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

exports.role = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRoleDashboard(req.user);
  res.json({ success: true, data });
});
