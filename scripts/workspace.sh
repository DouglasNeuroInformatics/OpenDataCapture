#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

script_file="$(readlink -f "$0")" 
project_root="$(dirname -- "$(dirname -- "${script_file}")")"

cd $project_root

workspace_dirs=($(awk '/-/{print $2}' pnpm-workspace.yaml | tr -d '"'))

target_workspace=${1:-}
if [ -z "$target_workspace" ] || [ $# -eq 0 ]; then
  echo "Usage: $0 <workspace> <command> [command-args ...]" >&2 && exit 1
fi
shift

for dir in "${workspace_dirs[@]}"; do
   package_json="${dir}/package.json"
   if [[ ! -f "$package_json" ]]; then
      continue
   fi
   workspace_name="$(cat $package_json | jq -r .name | sed 's/@opendatacapture\///')"
   if [[ $workspace_name == $target_workspace ]]; then
      cd $dir
      pnpm run "$@" 
      exit 0
   fi
done

echo "Error: Failed to find target workspace '${target_workspace}'"
exit 1
