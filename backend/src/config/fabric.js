const fs = require('fs');
const path = require('path');
const appConfig = require('./index');

const TEST_NETWORK = appConfig.fabricNetworkPath;

const ORG_DEFINITIONS = {
  HospitalAdminMSP: {
    mspId: 'HospitalAdminMSP',
    domain: 'hospitaladmin.example.com',
    peer: 'peer0.hospitaladmin.example.com',
    port: 7051,
  },
  ClinicalStaffMSP: {
    mspId: 'ClinicalStaffMSP',
    domain: 'clinicalstaff.example.com',
    peer: 'peer0.clinicalstaff.example.com',
    port: 8051,
  },
  DiagnosticStaffMSP: {
    mspId: 'DiagnosticStaffMSP',
    domain: 'diagnosticstaff.example.com',
    peer: 'peer0.diagnosticstaff.example.com',
    port: 9051,
  },
  PharmacyServicesMSP: {
    mspId: 'PharmacyServicesMSP',
    domain: 'pharmacy.example.com',
    peer: 'peer0.pharmacy.example.com',
    port: 10051,
  },
  InsuranceProviderMSP: {
    mspId: 'InsuranceProviderMSP',
    domain: 'insurance.example.com',
    peer: 'peer0.insurance.example.com',
    port: 11051,
  },
  PatientAccessMSP: {
    mspId: 'PatientAccessMSP',
    domain: 'patientaccess.example.com',
    peer: 'peer0.patientaccess.example.com',
    port: 12051,
  },
};

const CHANNELS = {
  patient: { channelName: 'patientchannel', chaincode: 'patientcc', contract: 'PatientContract' },
  treatment: { channelName: 'treatmentchannel', chaincode: 'treatmentcc', contract: 'TreatmentContract' },
  billing: { channelName: 'billingchannel', chaincode: 'billingcc', contract: 'BillingContract' },
  pharmacy: { channelName: 'pharmacychannel', chaincode: 'pharmacycc', contract: 'PharmacyContract' },
  emergency: { channelName: 'emergencychannel', chaincode: 'emergencycc', contract: 'EmergencyContract' },
  audit: { channelName: 'auditchannel', chaincode: 'auditcc', contract: 'AuditContract' },
};

/** Peers joined to each channel (must match network channel membership). */
const CHANNEL_PEERS = {
  patientchannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.clinicalstaff.example.com',
    'peer0.patientaccess.example.com',
  ],
  treatmentchannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.clinicalstaff.example.com',
    'peer0.diagnosticstaff.example.com',
  ],
  billingchannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.insurance.example.com',
    'peer0.patientaccess.example.com',
  ],
  pharmacychannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.clinicalstaff.example.com',
    'peer0.pharmacy.example.com',
  ],
  emergencychannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.clinicalstaff.example.com',
    'peer0.diagnosticstaff.example.com',
  ],
  auditchannel: [
    'peer0.hospitaladmin.example.com',
    'peer0.insurance.example.com',
  ],
};

const CHAINCODE_FUNCTIONS = {
  patient: {
    create: 'RegisterPatient',
    update: 'UpdatePatient',
    get: 'GetPatient',
    list: 'ListPatients',
    delete: 'DeletePatient',
    queryByField: 'QueryPatientByField',
  },
  treatment: {
    create: 'CreateTreatment',
    update: 'UpdateTreatment',
    get: 'GetTreatment',
    list: 'ListTreatments',
    delete: 'DeleteTreatment',
    queryByField: 'QueryTreatmentByField',
  },
  billing: {
    create: 'CreateBill',
    update: 'UpdateBill',
    get: 'GetBill',
    list: 'ListBills',
    delete: 'DeleteBill',
    queryByField: 'QueryBillByField',
  },
  pharmacy: {
    create: 'DispenseDrug',
    update: 'UpdateDispense',
    get: 'GetDispense',
    list: 'ListDispenses',
    delete: 'DeleteDispense',
    queryByField: 'QueryDispenseByField',
  },
  emergency: {
    create: 'LogEmergency',
    update: 'UpdateEmergency',
    get: 'GetEmergency',
    list: 'ListEmergencies',
    delete: 'DeleteEmergency',
    queryByField: 'QueryEmergencyByField',
  },
  audit: {
    create: 'LogAudit',
    update: 'UpdateAudit',
    get: 'GetAudit',
    list: 'ListAudits',
    delete: 'DeleteAudit',
    queryByField: 'QueryAuditByField',
  },
};

function resolveCredentialPath(relativeParts) {
  return path.join(TEST_NETWORK, ...relativeParts);
}

function findPrivateKey(orgDomain) {
  const keystoreDir = resolveCredentialPath([
    'organizations',
    'peerOrganizations',
    orgDomain,
    'users',
    `Admin@${orgDomain}`,
    'msp',
    'keystore',
  ]);
  if (!fs.existsSync(keystoreDir)) {
    throw new Error(`Keystore not found for ${orgDomain}`);
  }
  const keyFile = fs.readdirSync(keystoreDir).find((file) => file.endsWith('_sk'));
  if (!keyFile) throw new Error(`Private key not found for ${orgDomain}`);
  return path.join(keystoreDir, keyFile);
}

function findSignedCert(orgDomain) {
  return resolveCredentialPath([
    'organizations',
    'peerOrganizations',
    orgDomain,
    'users',
    `Admin@${orgDomain}`,
    'msp',
    'signcerts',
    'cert.pem',
  ]);
}

function findPeerTlsCert(peerName, orgDomain) {
  return resolveCredentialPath([
    'organizations',
    'peerOrganizations',
    orgDomain,
    'peers',
    peerName,
    'tls',
    'ca.crt',
  ]);
}

function buildConnectionProfile() {
  const organizations = {};
  const peers = {};

  Object.values(ORG_DEFINITIONS).forEach((org) => {
    organizations[org.mspId] = {
      mspid: org.mspId,
      peers: [org.peer],
    };
    const tlsCertPath = findPeerTlsCert(org.peer, org.domain);
    peers[org.peer] = {
      url: `grpcs://localhost:${org.port}`,
      tlsCACerts: {
        pem: fs.readFileSync(tlsCertPath).toString(),
      },
      grpcOptions: {
        'ssl-target-name-override': org.peer,
        hostnameOverride: org.peer,
        'grpc.keepalive_time_ms': 60000,
      },
    };
  });

  const channels = {};
  Object.values(CHANNELS).forEach(({ channelName }) => {
    const channelPeerNames = CHANNEL_PEERS[channelName] || [];
    channels[channelName] = {
      orderers: ['orderer.example.com'],
      peers: {},
    };
    channelPeerNames.forEach((peerName) => {
      channels[channelName].peers[peerName] = {};
    });
  });

  const ordererTlsPath = resolveCredentialPath([
    'organizations',
    'ordererOrganizations',
    'example.com',
    'orderers',
    'orderer.example.com',
    'tls',
    'ca.crt',
  ]);

  const orderers = {
    'orderer.example.com': {
      url: 'grpcs://localhost:7050',
      tlsCACerts: {
        pem: fs.readFileSync(ordererTlsPath).toString(),
      },
      grpcOptions: {
        'ssl-target-name-override': 'orderer.example.com',
        hostnameOverride: 'orderer.example.com',
        'grpc.keepalive_time_ms': 60000,
      },
    },
  };

  return {
    name: 'medichain-hms-network',
    version: '1.0.0',
    client: {
      organization: 'HospitalAdminMSP',
      tlsEnable: true,
      connection: {
        timeout: {
          peer: { endorser: '300' },
          orderer: '300',
        },
      },
    },
    organizations,
    peers,
    orderers,
    channels,
  };
}

module.exports = {
  TEST_NETWORK,
  ORG_DEFINITIONS,
  CHANNELS,
  CHANNEL_PEERS,
  CHAINCODE_FUNCTIONS,
  buildConnectionProfile,
  findPrivateKey,
  findSignedCert,
};
