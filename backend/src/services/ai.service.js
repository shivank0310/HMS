const aiConfig = require('../config/ai');
const { aiRequestRepo } = require('../repositories/misc.repository');
const { generateId } = require('../utils/id');

const MOCK_RESPONSES = {
  diagnosis: { confidence: 0.92, conditions: ['Hypertension', 'Type 2 Diabetes'], recommendation: 'Further lipid panel advised.' },
  prescription: { drugs: [{ name: 'Metformin', dose: '500mg', frequency: 'twice daily' }], warnings: [] },
  'risk-analysis': { readmissionRisk: 0.34, complicationRisk: 0.18, level: 'moderate' },
  'drug-interaction': { interactions: [], severity: 'none' },
  'read-xray': { findings: ['No acute cardiopulmonary abnormality'], confidence: 0.89 },
  'read-mri': { findings: ['Normal brain parenchyma'], confidence: 0.91 },
  chat: { reply: 'Based on provided symptoms, monitor vitals and consult a physician if symptoms persist.' },
  'symptom-checker': { possibleConditions: [{ name: 'Viral URI', probability: 0.62 }], urgency: 'low' },
};

async function runAi(type, input, userId) {
  let output;

  if (aiConfig.mockEnabled) {
    output = MOCK_RESPONSES[type] || { result: 'AI mock response', type };
  } else {
    const response = await fetch(`${aiConfig.serviceUrl}/predict/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(aiConfig.timeoutMs),
    });
    output = await response.json();
  }

  const saved = await aiRequestRepo.insert({
    id: generateId('ai'),
    userId: userId || null,
    type,
    input,
    output,
  });

  return { id: saved.id, type, output };
}

async function history(userId) {
  return aiRequestRepo.findByUser(userId);
}

module.exports = { runAi, history };
