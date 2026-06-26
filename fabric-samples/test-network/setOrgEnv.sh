#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0

ORG=${1:-HospitalAdmin}
set -e
set -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
PEER0_ORG1_CA=${DIR}/test-network/organizations/peerOrganizations/hospitaladmin.example.com/tlsca/tlsca.hospitaladmin.example.com-cert.pem
PEER0_ORG2_CA=${DIR}/test-network/organizations/peerOrganizations/clinicalstaff.example.com/tlsca/tlsca.clinicalstaff.example.com-cert.pem
PEER0_ORG3_CA=${DIR}/test-network/organizations/peerOrganizations/diagnosticstaff.example.com/tlsca/tlsca.diagnosticstaff.example.com-cert.pem
PEER0_ORG4_CA=${DIR}/test-network/organizations/peerOrganizations/pharmacy.example.com/tlsca/tlsca.pharmacy.example.com-cert.pem
PEER0_ORG5_CA=${DIR}/test-network/organizations/peerOrganizations/insurance.example.com/tlsca/tlsca.insurance.example.com-cert.pem
PEER0_ORG6_CA=${DIR}/test-network/organizations/peerOrganizations/patientaccess.example.com/tlsca/tlsca.patientaccess.example.com-cert.pem

case "${ORG,,}" in
  hospitaladmin|org1)
    CORE_PEER_LOCALMSPID=HospitalAdminMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/hospitaladmin.example.com/users/Admin@hospitaladmin.example.com/msp
    CORE_PEER_ADDRESS=localhost:7051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG1_CA}
    ;;
  clinicalstaff|org2)
    CORE_PEER_LOCALMSPID=ClinicalStaffMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/clinicalstaff.example.com/users/Admin@clinicalstaff.example.com/msp
    CORE_PEER_ADDRESS=localhost:8051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG2_CA}
    ;;
  diagnosticstaff|org3)
    CORE_PEER_LOCALMSPID=DiagnosticStaffMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/diagnosticstaff.example.com/users/Admin@diagnosticstaff.example.com/msp
    CORE_PEER_ADDRESS=localhost:9051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG3_CA}
    ;;
  pharmacy|org4)
    CORE_PEER_LOCALMSPID=PharmacyServicesMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/pharmacy.example.com/users/Admin@pharmacy.example.com/msp
    CORE_PEER_ADDRESS=localhost:10051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG4_CA}
    ;;
  insurance|org5)
    CORE_PEER_LOCALMSPID=InsuranceProviderMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/insurance.example.com/users/Admin@insurance.example.com/msp
    CORE_PEER_ADDRESS=localhost:11051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG5_CA}
    ;;
  patientaccess|org6)
    CORE_PEER_LOCALMSPID=PatientAccessMSP
    CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/patientaccess.example.com/users/Admin@patientaccess.example.com/msp
    CORE_PEER_ADDRESS=localhost:12051
    CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG6_CA}
    ;;
  *)
    echo "Unknown \"$ORG\""
    echo "Expected one of: HospitalAdmin, ClinicalStaff, DiagnosticStaff, Pharmacy, Insurance, PatientAccess"
    exit 1
    ;;
esac

echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_ORG1_CA=${PEER0_ORG1_CA}"
echo "PEER0_ORG2_CA=${PEER0_ORG2_CA}"
echo "PEER0_ORG3_CA=${PEER0_ORG3_CA}"
echo "PEER0_ORG4_CA=${PEER0_ORG4_CA}"
echo "PEER0_ORG5_CA=${PEER0_ORG5_CA}"
echo "PEER0_ORG6_CA=${PEER0_ORG6_CA}"
echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"
echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
