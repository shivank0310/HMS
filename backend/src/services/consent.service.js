const consentRepo = require('../repositories/consent.repository');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function grant(data) {
  return consentRepo.insert({
    id: generateId('cns'),
    patientId: data.patientId,
    granteeId: data.granteeId,
    scope: data.scope,
    status: 'active',
    emergency: !!data.emergency,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    metadata: data.metadata || {},
  });
}

async function revoke(id) {
  const item = await consentRepo.findById(id);
  if (!item) throw new ApiError('Consent not found', 404);
  return consentRepo.update(id, { status: 'revoked' });
}

async function list(patientId) {
  if (patientId) return consentRepo.findAll({ patientId, status: 'active' });
  return consentRepo.findAll({ status: 'active' });
}

async function history(patientId) {
  if (patientId) return consentRepo.findAll({ patientId });
  return consentRepo.findAll();
}

async function emergencyGrant(data) {
  return grant({ ...data, emergency: true, scope: data.scope || 'emergency_access' });
}

module.exports = { grant, revoke, list, history, emergencyGrant };
