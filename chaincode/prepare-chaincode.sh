#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SHARED_LIB="${ROOT_DIR}/shared/lib/dynamicRecordContract.js"
SHARED_DOCKERFILE="${ROOT_DIR}/shared/Dockerfile"

CHANNELS=(
  patientchannel
  treatmentchannel
  billingchannel
  emergencychannel
  pharmacychannel
  auditchannel
)

for channel in "${CHANNELS[@]}"; do
  target_dir="${ROOT_DIR}/${channel}/chaincode-javascript"
  mkdir -p "${target_dir}/lib"
  cp "${SHARED_LIB}" "${target_dir}/lib/dynamicRecordContract.js"
  cp "${SHARED_DOCKERFILE}" "${target_dir}/Dockerfile"
done

echo "Shared chaincode assets copied to all channel folders."
