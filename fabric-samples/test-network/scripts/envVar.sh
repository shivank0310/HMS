#!/usr/bin/env bash
#
# This is a collection of bash functions used by different scripts.
#

TEST_NETWORK_HOME=${TEST_NETWORK_HOME:-${PWD}}
. ${TEST_NETWORK_HOME}/scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${TEST_NETWORK_HOME}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/hospitaladmin.example.com/tlsca/tlsca.hospitaladmin.example.com-cert.pem
export PEER0_ORG2_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/clinicalstaff.example.com/tlsca/tlsca.clinicalstaff.example.com-cert.pem
export PEER0_ORG3_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/diagnosticstaff.example.com/tlsca/tlsca.diagnosticstaff.example.com-cert.pem
export PEER0_ORG4_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/pharmacy.example.com/tlsca/tlsca.pharmacy.example.com-cert.pem
export PEER0_ORG5_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/insurance.example.com/tlsca/tlsca.insurance.example.com-cert.pem
export PEER0_ORG6_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/patientaccess.example.com/tlsca/tlsca.patientaccess.example.com-cert.pem

peer_host_for_org() {
  case "$1" in
    1) echo "peer0.hospitaladmin.example.com" ;;
    2) echo "peer0.clinicalstaff.example.com" ;;
    3) echo "peer0.diagnosticstaff.example.com" ;;
    4) echo "peer0.pharmacy.example.com" ;;
    5) echo "peer0.insurance.example.com" ;;
    6) echo "peer0.patientaccess.example.com" ;;
    *) errorln "ORG Unknown"; return 1 ;;
  esac
}

org_domain_for_org() {
  case "$1" in
    1) echo "hospitaladmin.example.com" ;;
    2) echo "clinicalstaff.example.com" ;;
    3) echo "diagnosticstaff.example.com" ;;
    4) echo "pharmacy.example.com" ;;
    5) echo "insurance.example.com" ;;
    6) echo "patientaccess.example.com" ;;
    *) errorln "ORG Unknown"; return 1 ;;
  esac
}

peer_port_for_org() {
  case "$1" in
    1) echo "7051" ;;
    2) echo "8051" ;;
    3) echo "9051" ;;
    4) echo "10051" ;;
    5) echo "11051" ;;
    6) echo "12051" ;;
    *) errorln "ORG Unknown"; return 1 ;;
  esac
}

mspid_for_org() {
  case "$1" in
    1) echo "HospitalAdminMSP" ;;
    2) echo "ClinicalStaffMSP" ;;
    3) echo "DiagnosticStaffMSP" ;;
    4) echo "PharmacyServicesMSP" ;;
    5) echo "InsuranceProviderMSP" ;;
    6) echo "PatientAccessMSP" ;;
    *) errorln "ORG Unknown"; return 1 ;;
  esac
}

peer_ca_for_org() {
  case "$1" in
    1) echo "$PEER0_ORG1_CA" ;;
    2) echo "$PEER0_ORG2_CA" ;;
    3) echo "$PEER0_ORG3_CA" ;;
    4) echo "$PEER0_ORG4_CA" ;;
    5) echo "$PEER0_ORG5_CA" ;;
    6) echo "$PEER0_ORG6_CA" ;;
    *) errorln "ORG Unknown"; return 1 ;;
  esac
}

setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi

  infoln "Using organization ${USING_ORG}"

  CORE_PEER_LOCALMSPID=$(mspid_for_org "$USING_ORG") || return 1
  CORE_PEER_TLS_ROOTCERT_FILE=$(peer_ca_for_org "$USING_ORG") || return 1
  ORG_DOMAIN=$(org_domain_for_org "$USING_ORG") || return 1
  CORE_PEER_MSPCONFIGPATH=${TEST_NETWORK_HOME}/organizations/peerOrganizations/${ORG_DOMAIN}/users/Admin@${ORG_DOMAIN}/msp
  CORE_PEER_ADDRESS=localhost:$(peer_port_for_org "$USING_ORG") || return 1

  export CORE_PEER_LOCALMSPID CORE_PEER_TLS_ROOTCERT_FILE CORE_PEER_MSPCONFIGPATH CORE_PEER_ADDRESS

  if [ "$VERBOSE" = "true" ]; then
    env | grep CORE
  fi
}

parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals "$1"
    PEER=$(peer_host_for_org "$1")
    if [ -z "$PEERS" ]; then
      PEERS="$PEER"
    else
      PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
