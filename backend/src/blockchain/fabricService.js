const logger = require('../config/logger');
const { CHANNELS, CHAINCODE_FUNCTIONS } = require('../config/fabric');
const fabricPeerCli = require('./fabricPeerCli');
const { stringifyJson, parseJson } = require('../utils/helpers');

const USE_PEER_CLI = process.env.FABRIC_USE_PEER_CLI !== 'false';

async function submitRecord(moduleKey, mspId, recordId, fields, fnType = 'create') {
  const channelConfig = CHANNELS[moduleKey];
  const functions = CHAINCODE_FUNCTIONS[moduleKey];
  if (!channelConfig || !functions) {
    throw new Error(`Unknown blockchain module: ${moduleKey}`);
  }

  const fnName = functions[fnType] || functions.create;

  try {
    if (USE_PEER_CLI) {
      const result = await fabricPeerCli.submitRecord(moduleKey, mspId, recordId, fields, fnType);
      return parseJson(typeof result === 'string' ? result : JSON.stringify(result), { recordId, raw: result });
    }

    const { getContract } = require('./fabricGateway');
    const args = [recordId, stringifyJson(fields)];
    const contract = await getContract(channelConfig.channelName, channelConfig.chaincode, mspId);
    const result = await contract.submitTransaction(fnName, ...args);
    return parseJson(result.toString(), { recordId, raw: result.toString() });
  } catch (err) {
    logger.error('Fabric submit failed [%s.%s]: %s', moduleKey, fnName, err.message);
    throw err;
  }
}

async function evaluateRecord(moduleKey, mspId, recordId, fnType = 'get') {
  const channelConfig = CHANNELS[moduleKey];
  const functions = CHAINCODE_FUNCTIONS[moduleKey];
  const fnName = functions[fnType] || functions.get;

  try {
    if (USE_PEER_CLI) {
      return fabricPeerCli.evaluateRecord(moduleKey, mspId, recordId, fnType);
    }

    const { getContract } = require('./fabricGateway');
    const contract = await getContract(channelConfig.channelName, channelConfig.chaincode, mspId);
    const result = await contract.evaluateTransaction(fnName, recordId);
    return parseJson(result.toString(), null);
  } catch (err) {
    logger.warn('Fabric evaluate failed [%s.%s]: %s', moduleKey, fnName, err.message);
    return null;
  }
}

async function listRecords(moduleKey, mspId) {
  const channelConfig = CHANNELS[moduleKey];
  const functions = CHAINCODE_FUNCTIONS[moduleKey];

  try {
    if (USE_PEER_CLI) {
      const result = await fabricPeerCli.queryChaincode(
        channelConfig.channelName,
        channelConfig.chaincode,
        functions.list
      );
      return parseJson(typeof result === 'string' ? result : JSON.stringify(result), []);
    }

    const { getContract } = require('./fabricGateway');
    const contract = await getContract(channelConfig.channelName, channelConfig.chaincode, mspId);
    const result = await contract.evaluateTransaction(functions.list);
    return parseJson(result.toString(), []);
  } catch (err) {
    logger.warn('Fabric list failed [%s]: %s', moduleKey, err.message);
    return [];
  }
}

async function logAudit(mspId, recordId, fields) {
  return submitRecord('audit', mspId, recordId, fields, 'create');
}

module.exports = {
  submitRecord,
  evaluateRecord,
  listRecords,
  logAudit,
};
