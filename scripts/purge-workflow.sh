#!/usr/bin/env bash
# 
# Delete all runs of the workflow

if [ -z "$1" ]; then
  echo "ERROR: Must specify workflow to purge (e.g., ci.yaml)"
  exit 1
fi

gh run list --limit 500 --workflow "$1" --json databaseId | jq -r '.[] | .databaseId | @sh' | xargs -I{} gh run delete "{}"
