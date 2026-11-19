#!/usr/bin/env bash
#
# Runs a command while holding a lock that every checkout of this repository shares, so two heavy test
# runs (unit coverage, end-to-end) never overlap on one machine: together they exhaust its memory, and
# two end-to-end runs fight over the same ports. The lock is a directory in the git common directory,
# which every worktree shares, and `mkdir` either creates it or fails, so exactly one caller wins. A
# lock whose holder has exited without releasing it is taken over.

set -euo pipefail

lockDir="$(git rev-parse --path-format=absolute --git-common-dir)/opendatacapture-test.lock"
announced=false

while ! mkdir "$lockDir" 2>/dev/null; do
  holder="$(cat "$lockDir/pid" 2>/dev/null || true)"
  # Only "No such process" proves the holder gone: a sandboxed caller is refused permission to signal
  # a process it did not start, and that refusal must not read as a stale lock.
  if [ -n "$holder" ]; then
    case "$(kill -0 "$holder" 2>&1 || true)" in
      *'No such process'*)
        rm -rf "$lockDir"
        continue
        ;;
    esac
  # A holder writes its pid straight after creating the lock; one without a pid for a minute died in between.
  elif [ -n "$(find "$lockDir" -maxdepth 0 -mmin +1 2>/dev/null)" ]; then
    rm -rf "$lockDir"
    continue
  fi
  if [ "$announced" = false ]; then
    echo "Waiting for another test run to finish (pid ${holder:-unknown}: $(cat "$lockDir/command" 2>/dev/null || echo unknown))" >&2
    announced=true
  fi
  sleep 2
done

trap 'rm -rf "$lockDir"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "$$" >"$lockDir/pid"
echo "$* in $PWD" >"$lockDir/command"

"$@"
