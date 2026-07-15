#!/usr/bin/env bash
# Thin wrapper around the channel-aware Fabric lifecycle deploy script for
# MediChain chaincodes.
#
# Usage:
#   ./deploy-with-network.sh <channel|all> [version] [sequence]
#
set -eo pipefail

TARGET=${1:-all}
CC_VERSION=${2:-1.0}
CC_SEQUENCE=${3:-auto}

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_NETWORK_HOME="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"
export DOCKER_API_VERSION=1.43

declare -A CHANNEL_CC=(
  [patientchannel]=patientcc
  [treatmentchannel]=treatmentcc
  [billingchannel]=billingcc
  [emergencychannel]=emergencycc
  [pharmacychannel]=pharmacycc
  [auditchannel]=auditcc
)

declare -A CHANNEL_PATH=(
  [patientchannel]="${ROOT_DIR}/patientchannel/chaincode-javascript"
  [treatmentchannel]="${ROOT_DIR}/treatmentchannel/chaincode-javascript"
  [billingchannel]="${ROOT_DIR}/billingchannel/chaincode-javascript"
  [emergencychannel]="${ROOT_DIR}/emergencychannel/chaincode-javascript"
  [pharmacychannel]="${ROOT_DIR}/pharmacychannel/chaincode-javascript"
  [auditchannel]="${ROOT_DIR}/auditchannel/chaincode-javascript"
)

deploy_one() {
  local channel="$1"
  local cc_name="${CHANNEL_CC[$channel]}"
  local cc_path="${CHANNEL_PATH[$channel]}"

  if [[ -z "${cc_name}" || -z "${cc_path}" ]]; then
    echo "Unknown channel: ${channel}"
    exit 1
  fi

  echo "Deploying ${cc_name} on ${channel} via channel-aware Fabric lifecycle"
  TEST_NETWORK_HOME="${TEST_NETWORK_HOME}" bash "${ROOT_DIR}/deploy-channel.sh" \
    "${channel}" "${cc_name}" "${cc_path}" "${CC_VERSION}" "${CC_SEQUENCE}"
}

if [[ "${TARGET}" == "all" ]]; then
  for channel in patientchannel treatmentchannel billingchannel emergencychannel pharmacychannel auditchannel; do
    deploy_one "${channel}"
  done
else
  deploy_one "${TARGET}"
fi
