#!/usr/bin/env bash
#
# Remove local artifacts for a single channel so it can be recreated fresh.
#

set -euo pipefail

CHANNEL_NAME="${1:-}"

if [ -z "$CHANNEL_NAME" ]; then
  echo "Usage: $0 <channel-name>"
  exit 1
fi

CHANNEL_KEY="$(printf '%s' "$CHANNEL_NAME" | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')"

case "$CHANNEL_KEY" in
  patientchannel|treatmentchannel|billingchannel|emergencychannel|pharmacychannel|auditchannel)
    ;;
  *)
    echo "Unknown channel: $CHANNEL_NAME"
    exit 1
    ;;
esac

rm -f "channel-artifacts/${CHANNEL_NAME}.block"
rm -f "channel-artifacts/*anchors.tx"
rm -f "channel-artifacts/*config.json"
rm -f "channel-artifacts/*modified_config.json"
rm -f "channel-artifacts/*config_update.pb"
rm -f "channel-artifacts/*config_update.json"
rm -f "channel-artifacts/*original_config.pb"
rm -f "channel-artifacts/*modified_config.pb"
rm -f "channel-artifacts/config_block.pb"
rm -f "channel-artifacts/config_block.json"

echo "Removed local artifacts for ${CHANNEL_NAME}"
