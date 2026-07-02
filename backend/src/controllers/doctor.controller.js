const asyncHandler = require('../utils/asyncHandler');

exports.profile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { role: 'doctor', userId: req.user.sub } });
});
