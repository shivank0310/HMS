const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const logger = require('../config/logger');
const appConfig = require('../config/index');
const { CHANNELS, CHANNEL_PEERS } = require('../config/fabric');
const { parseJson } = require('../utils/helpers');

const execFileAsync = promisify(execFile);

const TEST_NETWORK = appConfig.fabricNetworkPath;
const FABRIC_BIN = path.join(TEST_NETWORK, '../bin/peer');
const FABRIC_CFG = path.join(TEST_NETWORK, '../config');
const ORDERER_CA = path.join(
  TEST_NETWORK,
  'organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem'
);

const MSP_TO_ORG = {
  HospitalAdminMSP: 1,
  ClinicalStaffMSP: 2,
  DiagnosticStaffMSP: 3,
  PharmacyServicesMSP: 4,
  InsuranceProviderMSP: 5,
  PatientAccessMSP: 6,
};

const ORG_CONFIG = {
  1: { msp: 'HospitalAdminMSP', domain: 'hospitaladmin.example.com', port: 7051, ca: 'PEER0_ORG1_CA' },
  2: { msp: 'ClinicalStaffMSP', domain: 'clinicalstaff.example.com', port: 8051, ca: 'PEER0_ORG2_CA' },
  3: { msp: 'DiagnosticStaffMSP', domain: 'diagnosticstaff.example.com', port: 9051, ca: 'PEER0_ORG3_CA' },
  4: { msp: 'PharmacyServicesMSP', domain: 'pharmacy.example.com', port: 10051, ca: 'PEER0_ORG4_CA' },
  5: { msp: 'InsuranceProviderMSP', domain: 'insurance.example.com', port: 11051, ca: 'PEER0_ORG5_CA' },
  6: { msp: 'PatientAccessMSP', domain: 'patientaccess.example.com', port: 12051, ca: 'PEER0_ORG6_CA' },
};

const PEER_TLS_CA = {
  1: path.join(TEST_NETWORK, 'organizations/peerOrganizations/hospitaladmin.example.com/tlsca/tlsca.hospitaladmin.example.com-cert.pem'),
  2: path.join(TEST_NETWORK, 'organizations/peerOrganizations/clinicalstaff.example.com/tlsca/tlsca.clinicalstaff.example.com-cert.pem'),
  3: path.join(TEST_NETWORK, 'organizations/peerOrganizations/diagnosticstaff.example.com/tlsca/tlsca.diagnosticstaff.example.com-cert.pem'),
  4: path.join(TEST_NETWORK, 'organizations/peerOrganizations/pharmacy.example.com/tlsca/tlsca.pharmacy.example.com-cert.pem'),
  5: path.join(TEST_NETWORK, 'organizations/peerOrganizations/insurance.example.com/tlsca/tlsca.insurance.example.com-cert.pem'),
  6: path.join(TEST_NETWORK, 'organizations/peerOrganizations/patientaccess.example.com/tlsca/tlsca.patientaccess.example.com-cert.pem'),
};

const CHANNEL_ORGS = {
  patientchannel: [1, 2, 6],
  treatmentchannel: [1, 2, 3],
  billingchannel: [1, 5, 6],
  pharmacychannel: [1, 2, 4],
  emergencychannel: [1, 2, 3],
  auditchannel: [1, 5],
};

function orgEnv(orgNum) {
  const cfg = ORG_CONFIG[orgNum];
  return {
    FABRIC_CFG_PATH: FABRIC_CFG,
    PATH: `${path.join(TEST_NETWORK, '../bin')}:${process.env.PATH}`,
    CORE_PEER_TLS_ENABLED: 'true',
    CORE_PEER_LOCALMSPID: cfg.msp,
    CORE_PEER_TLS_ROOTCERT_FILE: PEER_TLS_CA[orgNum],
    CORE_PEER_MSPCONFIGPATH: path.join(
      TEST_NETWORK,
      `organizations/peerOrganizations/${cfg.domain}/users/Admin@${cfg.domain}/msp`
    ),
    CORE_PEER_ADDRESS: `localhost:${cfg.port}`,
  };
}

function peerNamesForChannel(channelName) {
  return CHANNEL_PEERS[channelName] || [];
}

function orgsForChannel(channelName) {
  return CHANNEL_ORGS[channelName] || [1];
}

function buildPeerArgs(channelName) {
  const orgs = orgsForChannel(channelName);
  const args = [];
  orgs.forEach((orgNum) => {
    args.push('--peerAddresses', `localhost:${ORG_CONFIG[orgNum].port}`);
    args.push('--tlsRootCertFiles', PEER_TLS_CA[orgNum]);
  });
  return args;
}

async function runPeer(orgNum, args, timeoutMs = 45000) {
  const env = { ...process.env, ...orgEnv(orgNum) };
  try {
    const { stdout, stderr } = await execFileAsync(FABRIC_BIN, args, {
      env,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
    });
    if (stderr && !stderr.includes('Using organization')) {
      logger.debug('peer stderr: %s', stderr.trim());
    }
    return stdout.trim();
  } catch (err) {
    const msg = err.stderr?.trim() || err.stdout?.trim() || err.message;
    throw new Error(msg);
  }
}

async function queryChaincode(channelName, chaincodeName, fnName, ...args) {
  const payload = JSON.stringify({ Args: [fnName, ...args] });
  const peerArgs = [
    'chaincode', 'query',
    '-C', channelName,
    '-n', chaincodeName,
    '-c', payload,
  ];
  const output = await runPeer(1, peerArgs);
  return parseJson(output, output);
}

async function invokeChaincode(channelName, chaincodeName, fnName, ...args) {
  const payload = JSON.stringify({ Args: [fnName, ...args] });
  const peerArgs = [
    'chaincode', 'invoke',
    '-o', 'localhost:7050',
    '--ordererTLSHostnameOverride', 'orderer.example.com',
    '--tls',
    '--cafile', ORDERER_CA,
    '-C', channelName,
    '-n', chaincodeName,
    ...buildPeerArgs(channelName),
    '--waitForEvent', 'false',
    '-c', payload,
  ];
  const output = await runPeer(1, peerArgs, 90000);
  return parseJson(output, { success: true, raw: output });
}

async function submitRecord(moduleKey, mspId, recordId, fields, fnType = 'create') {
  const channelConfig = CHANNELS[moduleKey];
  const { CHAINCODE_FUNCTIONS } = require('../config/fabric');
  const functions = CHAINCODE_FUNCTIONS[moduleKey];
  const fnName = functions[fnType] || functions.create;
  const fieldsJson = JSON.stringify(fields);
  return invokeChaincode(channelConfig.channelName, channelConfig.chaincode, fnName, recordId, fieldsJson);
}

async function evaluateRecord(moduleKey, mspId, recordId, fnType = 'get') {
  const channelConfig = CHANNELS[moduleKey];
  const { CHAINCODE_FUNCTIONS } = require('../config/fabric');
  const functions = CHAINCODE_FUNCTIONS[moduleKey];
  const fnName = functions[fnType] || functions.get;
  return queryChaincode(channelConfig.channelName, channelConfig.chaincode, fnName, recordId);
}

module.exports = {
  submitRecord,
  evaluateRecord,
  queryChaincode,
  invokeChaincode,
};
