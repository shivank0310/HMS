const logger = require('../config/logger');
const fabricService = require('./fabricService');
const { splitRecord, buildBlockchainMeta } = require('./fieldMapper');

/**
 * Dual-write: persist off-chain in MongoDB first, then sync minimal fields to Fabric.
 */
async function syncToChain(moduleKey, mspId, record, fnType = 'create') {
  const recordId = record.id || record.recordId;
  const { onChain, offChainHash } = splitRecord(moduleKey, record);

  try {
    const chainResult = await fabricService.submitRecord(moduleKey, mspId, recordId, onChain, fnType);
    const meta = buildBlockchainMeta(moduleKey, recordId, { ...onChain, chainResult, offChainHash }, true);
    return { success: true, blockchain: meta, chainResult };
  } catch (err) {
    logger.error('Blockchain sync failed [%s/%s]: %s', moduleKey, recordId, err.message);
    const meta = buildBlockchainMeta(moduleKey, recordId, onChain, false, err.message);
    return { success: false, blockchain: meta, error: err.message };
  }
}

async function readFromChain(moduleKey, mspId, recordId) {
  return fabricService.evaluateRecord(moduleKey, mspId, recordId);
}

async function verifyIntegrity(moduleKey, mspId, mongoRecord) {
  try {
    const chainData = await readFromChain(moduleKey, mspId, mongoRecord.id);
    if (!chainData) return { verified: false, reason: 'not_on_chain' };

    const { offChainHash } = splitRecord(moduleKey, mongoRecord);
    const chainHash = chainData.offChainHash;
    return {
      verified: chainHash === offChainHash,
      chainHash,
      computedHash: offChainHash,
      chainData,
    };
  } catch (err) {
    return {
      verified: false,
      reason: err.message || 'chain_lookup_failed',
    };
  }
}

module.exports = { syncToChain, readFromChain, verifyIntegrity };
