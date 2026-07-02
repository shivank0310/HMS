#!/usr/bin/env bash
set -o pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_NETWORK="${TEST_NETWORK_HOME:-/home/ssingh1/Desktop/HMS/fabric-samples/test-network}"
export PATH="${TEST_NETWORK}/../bin:${PATH}"
export FABRIC_CFG_PATH="${TEST_NETWORK}/../config"
export TEST_NETWORK_HOME="${TEST_NETWORK}"
export OVERRIDE_ORG=""

cd "${TEST_NETWORK}"
. scripts/envVar.sh

bash "${ROOT_DIR}/prepare-chaincode.sh"

declare -A CHANNEL_CC=(
  [patientchannel]=patientcc
  [treatmentchannel]=treatmentcc
  [billingchannel]=billingcc
  [emergencychannel]=emergencycc
  [pharmacychannel]=pharmacycc
  [auditchannel]=auditcc
)

channel_orgs() {
  case "$1" in
    patientchannel) echo "1 2 6" ;;
    treatmentchannel) echo "1 2 3" ;;
    billingchannel) echo "1 5 6" ;;
    emergencychannel) echo "1 2 3" ;;
    pharmacychannel) echo "1 2 4" ;;
    auditchannel) echo "1 5" ;;
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
  esac
}

resolve_committed_package_id() {
  local channel="$1"
  local cc_name="$2"
  local packages_file="${ROOT_DIR}/ccaas-packages.json"
  if [[ -f "${packages_file}" ]]; then
    local pinned
    pinned=$(jq -r --arg cc "${cc_name}" '.[$cc] // empty' "${packages_file}")
    if [[ -n "${pinned}" && "${pinned}" != "null" ]]; then
      echo "${pinned}"
      return 0
    fi
  fi

  local label="${cc_name}_1.0"
  local candidate
  local candidates
  candidates=$(peer lifecycle chaincode queryinstalled --output json 2>/dev/null \
    | jq -r --arg cc_label "${label}" '[.installed_chaincodes[] | select(.label == $cc_label) | .package_id] | .[]')

  for candidate in ${candidates}; do
    docker rm -f "tmp_${cc_name}_ccaas" >/dev/null 2>&1 || true
    docker run --rm -d \
      --name "tmp_${cc_name}_ccaas" \
      --network fabric_test \
      -e CHAINCODE_SERVER_ADDRESS="0.0.0.0:9999" \
      -e CHAINCODE_ID="${candidate}" \
      -e CORE_CHAINCODE_ID_NAME="${candidate}" \
      "${cc_name}_ccaas_image:latest" >/dev/null

    sleep 2
    if timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListPatients"]}' >/dev/null 2>&1 \
      || timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListTreatments"]}' >/dev/null 2>&1 \
      || timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListBills"]}' >/dev/null 2>&1 \
      || timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListDispenses"]}' >/dev/null 2>&1 \
      || timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListEmergencies"]}' >/dev/null 2>&1 \
      || timeout 10 peer chaincode query -C "${channel}" -n "${cc_name}" -c '{"Args":["ListAudits"]}' >/dev/null 2>&1; then
      docker rm -f "tmp_${cc_name}_ccaas" >/dev/null 2>&1 || true
      echo "${candidate}"
      return 0
    fi
    docker rm -f "tmp_${cc_name}_ccaas" >/dev/null 2>&1 || true
  done

  return 1
}

for channel in patientchannel treatmentchannel billingchannel emergencychannel pharmacychannel auditchannel; do
  cc_name="${CHANNEL_CC[$channel]}"
  cc_path="${ROOT_DIR}/${channel}/chaincode-javascript"
  orgs="$(channel_orgs "${channel}")"

  echo "Rebuilding ${cc_name}..."
  docker build -q -f "${cc_path}/Dockerfile" -t "${cc_name}_ccaas_image:latest" "${cc_path}"

  package_id=""
  setGlobals 1
  package_id=$(resolve_committed_package_id "${channel}" "${cc_name}") || true
  if [[ -z "${package_id}" ]]; then
    echo "Skipping ${cc_name}; no working package id found for ${channel}"
    continue
  fi
  echo "Using package ${package_id} for ${cc_name} on ${channel}"

  for org in ${orgs}; do
    peername="$(peername_for_org "${org}")"
    container="${peername}_${cc_name}_ccaas"
    docker rm -f "${container}" >/dev/null 2>&1 || true
    docker run --rm -d \
      --name "${container}" \
      --network fabric_test \
      -e CHAINCODE_SERVER_ADDRESS="0.0.0.0:9999" \
      -e CHAINCODE_ID="${package_id}" \
      -e CORE_CHAINCODE_ID_NAME="${package_id}" \
      "${cc_name}_ccaas_image:latest" >/dev/null
  done
done

echo "All committed CCAAS chaincode containers restarted."
