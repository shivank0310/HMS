const insuranceRepo = require('../repositories/insurance.repository');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

async function submitClaim(data) {
  return insuranceRepo.insert({
    id: generateId('clm'),
    patientId: data.patientId,
    billingId: data.billingId || null,
    policyNumber: data.policyNumber || null,
    amount: data.amount,
    status: 'submitted',
    metadata: data.metadata || {},
  });
}

async function approve(id) {
  const item = await insuranceRepo.findById(id);
  if (!item) throw new ApiError('Claim not found', 404);
  return insuranceRepo.update(id, { status: 'approved' });
}

async function reject(id, reason) {
  const item = await insuranceRepo.findById(id);
  if (!item) throw new ApiError('Claim not found', 404);
  return insuranceRepo.update(id, {
    status: 'rejected',
    metadata: { ...(item.metadata || {}), rejectionReason: reason },
  });
}

async function history(patientId) {
  if (patientId) return insuranceRepo.findAll({ patientId });
  return insuranceRepo.findAll();
}

async function getPolicy(patientId) {
  const claims = await history(patientId);
  const latest = claims[0];
  return {
    patientId,
    policyNumber: latest?.policyNumber || null,
    status: latest?.status || 'unknown',
    metadata: latest?.metadata || {},
  };
}

async function getPaymentHistory(patientId) {
  const claims = await history(patientId);
  return claims.filter((c) => c.status === 'approved');
}

module.exports = { submitClaim, approve, reject, history, getPolicy, getPaymentHistory };
