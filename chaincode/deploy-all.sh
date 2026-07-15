#!/usr/bin/env bash
#
# Deploy all MediChain HMS JavaScript chaincodes to their respective channels.
#
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_NETWORK_HOME="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"

infoln() { echo -e "\033[0;34m[INFO]\033[0m $*"; }
successln() { echo -e "\033[0;32m[SUCCESS]\033[0m $*"; }

declare -A CHANNEL_CC=(
  [patientchannel]=patientcc
  [treatmentchannel]=treatmentcc
  [billingchannel]=billingcc
  [emergencychannel]=emergencycc
  [pharmacychannel]=pharmacycc
  [auditchannel]=auditcc
)

for channel in patientchannel treatmentchannel billingchannel emergencychannel pharmacychannel auditchannel; do
  cc_name="${CHANNEL_CC[$channel]}"
  cc_path="${ROOT_DIR}/${channel}/chaincode-javascript"
  infoln "============================================================"
  infoln "Deploying ${cc_name} to ${channel}"
  infoln "============================================================"
  TEST_NETWORK_HOME="${TEST_NETWORK_HOME}" bash "${ROOT_DIR}/deploy-channel.sh" \
    "${channel}" "${cc_name}" "${cc_path}" 1.0 auto
done

successln "All MediChain chaincodes deployed successfully."
