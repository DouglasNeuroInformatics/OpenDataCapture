#!/usr/bin/env bash
#
# Lists the workspace packages that should be published to npm on release.
#
# A package is "publishable" when it is not private and declares a `publishConfig`
# field in its package.json. This is the single source of truth consumed by both
# scripts/increment-version.sh (to keep versions in sync) and the release workflow
# (to decide what to publish). Adding a future package only requires the
# `publishConfig` field — no list needs editing here.
#
# Output (one package per line, tab-separated): <name>\t<version>\t<package.json path>

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

projectRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

# Enumerate every workspace package (depth -1 = workspace packages only, no deps),
# then keep the non-private ones that declare a publishConfig.
pnpm -C "$projectRoot" ls -r --depth -1 --json \
  | jq -r '.[].path' \
  | while read -r dir; do
      pkg="$dir/package.json"
      [ -f "$pkg" ] || continue
      jq -r --arg path "$pkg" \
        'select(.private != true and .publishConfig != null) | [.name, .version, $path] | @tsv' "$pkg"
    done \
  | sort
