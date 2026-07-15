#!/usr/bin/env bash
#
# Deploy JavaScript chaincode to a MediChain HMS channel using the Fabric
# lifecycle flow (package, install, approve, commit).
#
# Usage:
#   ./deploy-channel.sh <channel> <cc_name> <cc_src_path> [version] [sequence]
#
set -eo pipefail

CHANNEL_NAME=${1:-}
CC_NAME=${2:-}
CC_SRC_PATH=${3:-}
CC_VERSION=${4:-1.0}
CC_SEQUENCE=${5:-1}
CCAAS_SERVER_PORT=${CCAAS_SERVER_PORT:-9999}
DELAY=${DELAY:-3}
MAX_RETRY=${MAX_RETRY:-5}
VERBOSE=${VERBOSE:-false}

if [[ -z "$CHANNEL_NAME" || -z "$CC_NAME" || -z "$CC_SRC_PATH" ]]; then
  echo "Usage: $0 <channel> <cc_name> <cc_src_path> [version] [sequence]"
  exit 1
fi

TEST_NETWORK_HOME="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"
export TEST_NETWORK_HOME
export PATH="${TEST_NETWORK_HOME}/../bin:${PATH}"
export FABRIC_CFG_PATH="${TEST_NETWORK_HOME}/../config"
export OVERRIDE_ORG=""
export DOCKER_API_VERSION=1.43

REAL_DOCKER_BIN="$(command -v docker)"
if [[ -z "${REAL_DOCKER_BIN}" ]]; then
  echo "docker binary not found in PATH"
  exit 1
fi

DOCKER_WRAPPER_DIR="$(mktemp -d /tmp/hms-docker-wrapper.XXXXXX)"
cat > "${DOCKER_WRAPPER_DIR}/docker" <<EOF
#!/usr/bin/env bash
export DOCKER_API_VERSION=1.43
exec "${REAL_DOCKER_BIN}" "\$@"
EOF
chmod +x "${DOCKER_WRAPPER_DIR}/docker"
export PATH="${DOCKER_WRAPPER_DIR}:${PATH}"

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

packageChaincode() {
  local source_path="$1"
  local label="${CC_NAME}_${CC_VERSION}"
  local address="${CC_NAME}_ccaas:${CCAAS_SERVER_PORT}"
  local tempdir
  tempdir=$(mktemp -d -t "${CC_NAME}.XXXXXXXX") || fatalln "Error creating temporary directory"

  infoln "Packaging CCAAS chaincode ${CC_NAME} from ${source_path}"
  mkdir -p "${tempdir}/src" "${tempdir}/pkg"

  cat > "${tempdir}/src/connection.json" <<EOF
{
  "address": "${address}",
  "dial_timeout": "10s",
  "tls_required": false
}
EOF

  cat > "${tempdir}/pkg/metadata.json" <<EOF
{
  "type": "ccaas",
  "label": "${label}"
}
EOF

  tar -C "${tempdir}/src" -czf "${tempdir}/pkg/code.tar.gz" .
  tar -C "${tempdir}/pkg" -czf "${CC_NAME}.tar.gz" metadata.json code.tar.gz
  rm -rf "${tempdir}"

  PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "${CC_NAME}.tar.gz")
}

startChaincodeService() {
  local container_name="${CC_NAME}_ccaas"
  local image_name="node:18-alpine"
  local source_path="$1"

  infoln "Starting CCAAS container ${container_name} on fabric_test"
  if docker ps -a --format '{{.Names}}' | grep -qx "${container_name}"; then
    docker rm -f "${container_name}" >/dev/null 2>&1 || true
  fi

  docker run -d \
    --name "${container_name}" \
    --network fabric_test \
    -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:${CCAAS_SERVER_PORT} \
    -e CHAINCODE_ID="${PACKAGE_ID}" \
    -e CORE_CHAINCODE_ID_NAME="${PACKAGE_ID}" \
    -v "${source_path}:/chaincode" \
    -w /chaincode \
    "${image_name}" \
    sh -lc 'npm run start:server-nontls'

  sleep 3
}

CC_SRC_PATH="$(cd "$(dirname "${CC_SRC_PATH}")" && pwd)/$(basename "${CC_SRC_PATH}")"
if [[ ! -d "${CC_SRC_PATH}" ]]; then
  fatalln "Chaincode path does not exist: ${CC_SRC_PATH}"
fi

CHANNEL_ORGS="$(channel_orgs "${CHANNEL_NAME}")"
infoln "Deploying ${CC_NAME} to ${CHANNEL_NAME} with orgs: ${CHANNEL_ORGS}"

if [[ ! -d "${CC_SRC_PATH}" ]]; then
  fatalln "Chaincode source path does not exist: ${CC_SRC_PATH}"
fi

packageChaincode "${CC_SRC_PATH}"
PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "${CC_NAME}.tar.gz")
successln "Chaincode packaged with Package ID: ${PACKAGE_ID}"

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

startChaincodeService "${CC_SRC_PATH}"

successln "Chaincode ${CC_NAME} deployed on ${CHANNEL_NAME}"
exit 0
