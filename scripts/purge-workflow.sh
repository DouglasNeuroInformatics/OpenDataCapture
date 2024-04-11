#!/usr/bin/env bash
# 
# Delete all runs of the workflow

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || echo "Error: Bash >= 5.0 is required for this script" && exit 1

if [ -z "$1" ]; then
  echo "ERROR: Must specify workflow to purge (e.g., ci.yaml)"
  exit 1
fi

gh run list --limit 500 --workflow "$1" --json databaseId | jq -r '.[] | .databaseId | @sh' | xargs -I{} gh run delete "{}"
