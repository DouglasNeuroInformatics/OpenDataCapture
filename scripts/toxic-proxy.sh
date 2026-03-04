#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

PROJECT_ROOT="$(dirname -- "$(dirname -- "$(readlink -f "$0")")")"

source "${PROJECT_ROOT}/.env"

API_DEV_SERVER_PORT="${API_DEV_SERVER_PORT:-}"
API_DEV_TOXIC_PROXY_PORT="${API_DEV_TOXIC_PROXY_PORT:-}"

if [[ -z "$API_DEV_SERVER_PORT" ]]; then
  echo "Error: API_DEV_SERVER_PORT is not set" >&2
  exit 1
fi

if [ -z "$API_DEV_TOXIC_PROXY_PORT" ]; then
  exit 0
fi

cleanup() {
  echo "Shutting down..."
  kill "$TOXIPROXY_PID" 2>/dev/null || true
  wait "$TOXIPROXY_PID" 2>/dev/null || true
}

trap cleanup EXIT

toxiproxy-server &
TOXIPROXY_PID=$!
sleep 1

toxiproxy-cli create --listen "0.0.0.0:$API_DEV_TOXIC_PROXY_PORT" --upstream "127.0.0.1:$API_DEV_SERVER_PORT" odc-api

toxiproxy-cli toxic add -n downstream-bandwidth -t bandwidth -a rate=5000 -a type=downstream odc-api

toxiproxy-cli toxic add -n upstream-bandwidth -t bandwidth -a rate=2500 -a type=upstream odc-api

toxiproxy-cli toxic add -n latency -t latency -a latency=50 -a jitter=500 -a type=downstream -toxicity 0.2 odc-api

toxiproxy-cli toxic add -n random-resets -t reset_peer -a type=tox_type=downstream -toxicity 0.1 odc-api

wait "$TOXIPROXY_PID"

