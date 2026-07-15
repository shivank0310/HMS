#!/usr/bin/env bash
#
# Bring up the MediChain Fabric network, create all HMS channels, and deploy chaincode.
#
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_NETWORK="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"

export PATH="${TEST_NETWORK}/../bin:${PATH}"

cd "${TEST_NETWORK}"

infoln() { echo -e "\033[0;34m[INFO]\033[0m $*"; }
successln() { echo -e "\033[0;32m[SUCCESS]\033[0m $*"; }
errorln() { echo -e "\033[0;31m[ERROR]\033[0m $*"; }

if ! command -v peer >/dev/null 2>&1; then
  errorln "Fabric peer binary not found in PATH"
  exit 1
fi

infoln "Starting Fabric network..."
./network.sh up -ca

for channel in patientchannel treatmentchannel billingchannel emergencychannel pharmacychannel auditchannel; do
  if docker ps --format '{{.Names}}' | grep -q "peer0.hospitaladmin.example.com"; then
    infoln "Creating channel ${channel}..."
    if ! ./network.sh createChannel -c "${channel}"; then
      infoln "Channel ${channel} already exists or could not be recreated; continuing."
    fi
  fi
done

infoln "Deploying all JavaScript chaincodes..."
TEST_NETWORK_HOME="${TEST_NETWORK}" bash "${ROOT_DIR}/deploy-all.sh"

successln "MediChain network, channels, and chaincodes are ready."
