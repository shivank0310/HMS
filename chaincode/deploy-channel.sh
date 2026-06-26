#!/usr/bin/env bash
#
# Deploy JavaScript chaincode (Chaincode-as-a-Service) to a MediChain HMS channel.
#
# Usage:
#   ./deploy-channel.sh <channel> <cc_name> <cc_src_path> [version] [sequence]
#
set -o pipefail

CHANNEL_NAME=${1:-}
CC_NAME=${2:-}
CC_SRC_PATH=${3:-}
CC_VERSION=${4:-1.0}
CC_SEQUENCE=${5:-1}
DELAY=${DELAY:-3}
MAX_RETRY=${MAX_RETRY:-5}
VERBOSE=${VERBOSE:-false}
CCAAS_SERVER_PORT=${CCAAS_SERVER_PORT:-9999}
CONTAINER_CLI=${CONTAINER_CLI:-docker}

if [[ -z "$CHANNEL_NAME" || -z "$CC_NAME" || -z "$CC_SRC_PATH" ]]; then
  echo "Usage: $0 <channel> <cc_name> <cc_src_path> [version] [sequence]"
  exit 1
fi

TEST_NETWORK_HOME="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"
export TEST_NETWORK_HOME
export PATH="${TEST_NETWORK_HOME}/../bin:${PATH}"
export FABRIC_CFG_PATH="${TEST_NETWORK_HOME}/../config"
export OVERRIDE_ORG=""

cd "${TEST_NETWORK_HOME}"
. scripts/utils.sh
. scripts/envVar.sh
. scripts/ccutils.sh

channel_orgs() {
  case "$1" in
    patientchannel) echo "1 2 6" ;;
    treatmentchannel) echo "1 2 3" ;;
    billingchannel) echo "1 5 6" ;;
    emergencychannel) echo "1 2 3" ;;
    pharmacychannel) echo "1 2 4" ;;
    auditchannel) echo "1 5" ;;
    *) echo "1 2" ;;
  esac
}

peername_for_org() {
  case "$1" in
    1) echo "peer0hospitaladmin" ;;
    2) echo "peer0clinicalstaff" ;;
    3) echo "peer0diagnosticstaff" ;;
    4) echo "peer0pharmacy" ;;
    5) echo "peer0insurance" ;;
    6) echo "peer0patientaccess" ;;
    *) return 1 ;;
  esac
}

build_readiness_checks() {
  local approved_orgs="$1"
  local all_orgs="$2"
  local checks=()
  for org in ${all_orgs}; do
    local msp
    msp=$(mspid_for_org "${org}")
    if echo " ${approved_orgs} " | grep -q " ${org} "; then
      checks+=("\"${msp}\": true")
    else
      checks+=("\"${msp}\": false")
    fi
  done
  printf '%s\n' "${checks[@]}"
}

packageCcaasChaincode() {
  local address="{{.peername}}_${CC_NAME}_ccaas:${CCAAS_SERVER_PORT}"
  local tempdir
  tempdir=$(mktemp -d)

  mkdir -p "${tempdir}/src" "${tempdir}/pkg"
  cat > "${tempdir}/src/connection.json" <<CONN_EOF
{
  "address": "${address}",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

  cat > "${tempdir}/pkg/metadata.json" <<META_EOF
{
  "type": "ccaas",
  "label": "${CC_NAME}_${CC_VERSION}"
}
META_EOF

  tar -C "${tempdir}/src" -czf "${tempdir}/pkg/code.tar.gz" .
  tar -C "${tempdir}/pkg" -czf "${CC_NAME}.tar.gz" metadata.json code.tar.gz
  rm -rf "${tempdir}"

  PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "${CC_NAME}.tar.gz")
  successln "Chaincode packaged for CCAAS at ${address}"
}

startCcaasContainers() {
  for org in ${CHANNEL_ORGS}; do
    local peername container_name
    peername=$(peername_for_org "${org}")
    container_name="${peername}_${CC_NAME}_ccaas"

    ${CONTAINER_CLI} rm -f "${container_name}" >/dev/null 2>&1 || true
    infoln "Starting CCAAS container ${container_name}..."
    ${CONTAINER_CLI} run --rm -d \
      --name "${container_name}" \
      --network fabric_test \
      -e CHAINCODE_SERVER_ADDRESS="0.0.0.0:${CCAAS_SERVER_PORT}" \
      -e CHAINCODE_ID="${PACKAGE_ID}" \
      -e CORE_CHAINCODE_ID_NAME="${PACKAGE_ID}" \
      "${CC_NAME}_ccaas_image:latest" >/dev/null
  done
}

CC_SRC_PATH="$(cd "$(dirname "${CC_SRC_PATH}")" && pwd)/$(basename "${CC_SRC_PATH}")"
if [[ ! -d "${CC_SRC_PATH}" ]]; then
  fatalln "Chaincode path does not exist: ${CC_SRC_PATH}"
fi

CHANNEL_ORGS="$(channel_orgs "${CHANNEL_NAME}")"
infoln "Deploying ${CC_NAME} (javascript CCAAS) to ${CHANNEL_NAME} with orgs: ${CHANNEL_ORGS}"

if [[ ! -d "${CC_SRC_PATH}/node_modules" ]]; then
  infoln "Installing npm dependencies in ${CC_SRC_PATH}"
  (cd "${CC_SRC_PATH}" && npm install --omit=dev)
fi

infoln "Building CCAAS docker image ${CC_NAME}_ccaas_image:latest"
${CONTAINER_CLI} build -f "${CC_SRC_PATH}/Dockerfile" -t "${CC_NAME}_ccaas_image:latest" "${CC_SRC_PATH}" >&log.txt
res=$?
cat log.txt
verifyResult $res "Docker build of chaincode-as-a-service container failed"

packageCcaasChaincode
infoln "Package ID: ${PACKAGE_ID}"

for org in ${CHANNEL_ORGS}; do
  infoln "Installing chaincode on org${org}..."
  installChaincode "${org}"
done

resolveSequence

queryInstalled 1

approved=""
for org in ${CHANNEL_ORGS}; do
  infoln "Approving chaincode definition for org${org}..."
  approveForMyOrg "${org}"
  approved="${approved} ${org}"
  checks=($(build_readiness_checks "${approved}" "${CHANNEL_ORGS}"))
  checkCommitReadiness "${org}" "${checks[@]}"
done

commitChaincodeDefinition ${CHANNEL_ORGS}

for org in ${CHANNEL_ORGS}; do
  queryCommitted "${org}"
done

startCcaasContainers

successln "Chaincode ${CC_NAME} deployed on ${CHANNEL_NAME}"
exit 0
