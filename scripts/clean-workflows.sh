#!/usr/bin/env bash
# 
# Delete all the workflows that are currently disabled

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

org=DouglasNeuroInformatics
repo=OpenDataCapture

# Get workflow IDs with status "disabled_manually"
mapfile -t workflow_ids < <(gh api "repos/$org/$repo/actions/workflows" --paginate | jq '.workflows[] | select(.["state"] | contains("disabled_manually")) | .id')

for workflow_id in "${workflow_ids[@]}"; do
  echo "Listing runs for the workflow ID $workflow_id"
  mapfile -t run_ids < <(gh api "repos/$org/$repo/actions/workflows/$workflow_id/runs" --paginate | jq '.workflow_runs[].id')
  for run_id in "${run_ids[@]}"; do
    echo "Deleting Run ID $run_id"
    gh api "repos/$org/$repo/actions/runs/$run_id" -X DELETE >/dev/null
  done
done
