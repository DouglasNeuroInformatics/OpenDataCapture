#!/usr/bin/env bash

# Check bash version
if [[ ${BASH_VERSINFO[0]} -lt 4 ]]; then
    echo "You need Bash version 4 or later to run this script."
    exit 1
fi

# Associative array (dictionary) mapping workspaces to directories
declare -A WORKSPACE_DIRS
WORKSPACE_DIRS=(
    ["api"]="${PWD}/apps/api"
    ["web"]="${PWD}/apps/web"
)

# Check if at least two arguments are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <workspace> <command> [command-args ...]"
    exit 1
fi

# Extract the workspace and remove it from the arguments
workspace="$1"
shift

# Check if workspace is in the dictionary of allowed values
if [[ ! ${WORKSPACE_DIRS["$workspace"]} ]]; then
    echo "Error: '$workspace' is not a valid workspace"
    exit 1
fi

DIR=${WORKSPACE_DIRS["$workspace"]}
cd "$DIR" 
bun run "$@"
