const aiConfig = require('../config/ai');

async function mockPredict(type, input) {
  return require('../services/ai.service').runAi(type, input);
}

module.exports = { mockPredict, config: aiConfig };
