#!/usr/bin/env bash
set -eo pipefail
: ${CORE_PEER_TLS_ENABLED:="false"}
exec npm run start:server-nontls
