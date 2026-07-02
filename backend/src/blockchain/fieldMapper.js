const crypto = require('crypto');
const { CHANNELS } = require('../config/fabric');

/**
 * On-chain fields: minimal immutable audit trail (hashes + key identifiers).
 * Off-chain fields: full clinical/business data stored in MongoDB.
 */
const FIELD_SETS = {
  patient: {
    onChain: ['recordId', 'mrn', 'fullName', 'gender', 'bloodGroup', 'status', 'offChainHash'],
    offChain: ['dateOfBirth', 'contactEmail', 'contactPhone', 'address', 'allergies', 'emergencyContact', 'metadata', 'userId'],
  },
  treatment: {
    onChain: ['recordId', 'patientId', 'diagnosis', 'status', 'doctorId', 'offChainHash'],
    offChain: ['notes', 'vitals', 'metadata', 'referral', 'dischargeSummary'],
  },
  billing: {
    onChain: ['recordId', 'patientId', 'amount', 'currency', 'status', 'invoiceNumber', 'offChainHash'],
    offChain: ['lineItems', 'paymentDetails', 'metadata', 'taxBreakdown'],
  },
  pharmacy: {
    onChain: ['recordId', 'patientId', 'drugName', 'quantity', 'status', 'offChainHash'],
    offChain: ['prescriptionId', 'batchNumber', 'instructions', 'metadata'],
  },
  emergency: {
    onChain: ['recordId', 'patientId', 'reason', 'status', 'grantedBy', 'offChainHash'],
    offChain: ['metadata', 'accessScope', 'clinicalNotes'],
  },
  audit: {
    onChain: ['recordId', 'action', 'resource', 'resourceId', 'userId', 'mspId', 'offChainHash'],
    offChain: ['metadata', 'ipAddress', 'userAgent', 'payload'],
  },
  diagnosis: {
    onChain: ['recordId', 'patientId', 'type', 'status', 'offChainHash'],
    offChain: ['reportUrl', 'findings', 'metadata', 'labValues', 'images'],
  },
};

function hashOffChainData(data) {
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function pickFields(source, keys) {
  const result = {};
  keys.forEach((key) => {
    const val = source[key];
    if (val === undefined || val === null || val === '') return;
    if (Array.isArray(val) && val.length === 0) return;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return;
    result[key] = val;
  });
  return result;
}

function splitRecord(moduleKey, record) {
  const config = FIELD_SETS[moduleKey];
  if (!config) {
    return { onChain: { ...record }, offChain: {} };
  }

  const recordId = record.id || record.recordId;
  const offChain = pickFields(record, config.offChain);
  const offChainHash = hashOffChainData(offChain);

  const onChain = {
    ...pickFields(record, config.onChain.filter((k) => k !== 'offChainHash')),
    recordId,
    offChainHash,
  };

  return { onChain, offChain, offChainHash };
}

function buildBlockchainMeta(moduleKey, recordId, onChainSnapshot, synced = true, error = null) {
  const channelConfig = CHANNELS[moduleKey];
  return {
    recordId,
    channel: channelConfig?.channelName,
    chaincode: channelConfig?.chaincode,
    synced,
    syncedAt: synced ? new Date() : undefined,
    onChainSnapshot,
    lastError: error || undefined,
  };
}

module.exports = {
  FIELD_SETS,
  splitRecord,
  hashOffChainData,
  buildBlockchainMeta,
};
