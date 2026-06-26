#!/usr/bin/env bash
# Start Hyperledger Blockchain Explorer for MediChain HMS (Docker mode)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NETWORK="${SCRIPT_DIR}/../test-network"
EXPLORER_DIR="${SCRIPT_DIR}"

echo "=== MediChain HMS — Blockchain Explorer Startup ==="

# Verify Fabric network is running
if ! docker ps --format '{{.Names}}' | grep -q 'peer0.hospitaladmin.example.com'; then
  echo "ERROR: Fabric network is not running."
  echo "Start it first:"
  echo "  cd ${TEST_NETWORK} && ./network.sh up -ca"
  exit 1
fi

# Restart clinical staff peer if it crashed (CouchDB race on boot)
if ! docker ps --format '{{.Names}} {{.Status}}' | grep 'peer0.clinicalstaff.example.com' | grep -q 'Up'; then
  echo "Restarting peer0.clinicalstaff.example.com..."
  docker start peer0.clinicalstaff.example.com
  sleep 5
fi

# Verify all peer ports
for port in 7051 8051 9051 10051 11051 12051; do
  if ! timeout 2 bash -c "echo >/dev/tcp/127.0.0.1/$port" 2>/dev/null; then
    echo "WARNING: Peer port $port is not reachable"
  fi
done

cd "${EXPLORER_DIR}"
docker compose up -d

echo ""
echo "Explorer starting at http://localhost:8080"
echo "Login: exploreradmin / exploreradminpw"
echo ""
echo "All 6 healthcare orgs mapped:"
echo "  Org1 HospitalAdmin     → peer0.hospitaladmin.example.com:7051"
echo "  Org2 ClinicalStaff     → peer0.clinicalstaff.example.com:8051"
echo "  Org3 DiagnosticStaff   → peer0.diagnosticstaff.example.com:9051"
echo "  Org4 PharmacyServices  → peer0.pharmacy.example.com:10051"
echo "  Org5 InsuranceProvider → peer0.insurance.example.com:11051"
echo "  Org6 PatientAccess     → peer0.patientaccess.example.com:12051"
echo ""
echo "Channels: patientchannel, treatmentchannel, billingchannel,"
echo "          emergencychannel, pharmacychannel, auditchannel"
