const aiService = require('../services/ai.service');
const asyncHandler = require('../utils/asyncHandler');

const handler = (type) => asyncHandler(async (req, res) => {
  const data = await aiService.runAi(type, req.body, req.user?.sub);
  res.json({ success: true, data });
});

exports.diagnosis = handler('diagnosis');
exports.prescription = handler('prescription');
exports.riskAnalysis = handler('risk-analysis');
exports.drugInteraction = handler('drug-interaction');
exports.readXray = handler('read-xray');
exports.readMri = handler('read-mri');
exports.chat = handler('chat');
exports.symptomChecker = handler('symptom-checker');

exports.history = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await aiService.history(req.user?.sub) });
});
