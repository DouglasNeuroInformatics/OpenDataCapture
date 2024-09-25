#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

if [ "$#" -ne 1 ] || ([ "$1" != "development" ] && [ "$1" != "test" ]); then
  echo "Usage: $0 {development|test}" >&2 && exit 1
fi

mongosh "data-capture-$1" --eval 'db.dropDatabase()'
