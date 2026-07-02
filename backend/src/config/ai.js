module.exports = {
  serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
  mockEnabled: process.env.AI_MOCK !== 'false',
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS, 10) || 30000,
};
