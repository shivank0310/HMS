const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const appConfig = require('../config/index');
const {
  ORG_DEFINITIONS,
  buildConnectionProfile,
  findPrivateKey,
  findSignedCert,
} = require('../config/fabric');

const gateways = new Map();
const walletPath = path.resolve(__dirname, '../../data/fabric-wallet');

async function ensureWalletIdentity(mspId) {
  const org = ORG_DEFINITIONS[mspId];
  if (!org) throw new Error(`Unknown MSP: ${mspId}`);

  fs.mkdirSync(walletPath, { recursive: true });
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identityLabel = `${mspId}-admin`;

  const existing = await wallet.get(identityLabel);
  if (existing) return wallet;

  const cert = fs.readFileSync(findSignedCert(org.domain)).toString();
  const key = fs.readFileSync(findPrivateKey(org.domain)).toString();

  await wallet.put(identityLabel, {
    credentials: { certificate: cert, privateKey: key },
    mspId,
    type: 'X.509',
  });

  return wallet;
}

async function getGateway(mspId = 'HospitalAdminMSP') {
  if (gateways.has(mspId)) {
    return gateways.get(mspId);
  }

  const connectionProfile = buildConnectionProfile();
  connectionProfile.client.organization = mspId;
  const wallet = await ensureWalletIdentity(mspId);
  const gateway = new Gateway();

  await gateway.connect(connectionProfile, {
    wallet,
    identity: `${mspId}-admin`,
    discovery: {
      enabled: appConfig.fabricDiscovery,
      asLocalhost: false,
    },
  });

  gateways.set(mspId, gateway);
  logger.info('Fabric gateway connected for %s', mspId);
  return gateway;
}

async function getContract(channelName, chaincodeName, mspId = 'HospitalAdminMSP') {
  const gateway = await getGateway(mspId);
  const network = await gateway.getNetwork(channelName);
  return network.getContract(chaincodeName);
}

async function disconnectAll() {
  for (const [mspId, gateway] of gateways.entries()) {
    try {
      gateway.disconnect();
    } catch (err) {
      logger.warn('Failed to disconnect gateway %s: %s', mspId, err.message);
    }
  }
  gateways.clear();
}

module.exports = { getGateway, getContract, disconnectAll, ensureWalletIdentity };
