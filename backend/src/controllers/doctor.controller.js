const { doctorRepo } = require('../repositories/misc.repository');
const asyncHandler = require('../utils/asyncHandler');

exports.profile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { role: 'doctor', userId: req.user.sub } });
});

exports.list = asyncHandler(async (req, res) => {
  const department = req.query.department;
  const filter = department ? { department } : {};
  res.json({ success: true, data: await doctorRepo.findAll(filter) });
});
