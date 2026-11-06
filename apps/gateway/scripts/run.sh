#!/bin/sh

set -eu

DATABASE_FILE=${GATEWAY_DATABASE_URL#file:}
DATABASE_DIR=$(dirname "$DATABASE_FILE")
EMPTY_DATABASE_FILE="/app/gateway.tmpl.db"

# The gateway faces the public internet, so its server must not run as root. The image still starts
# as root: on existing deployments the bind-mounted database directory (and the database file the
# old root entrypoint copied into it) is owned by root, and only root can hand it to `node`. Fix the
# ownership of that directory, the only path the server writes, then re-run this script as `node`.
if [ "$(id -u)" = '0' ]; then
  mkdir -p "$DATABASE_DIR"
  find "$DATABASE_DIR" \! -user node -exec chown node:node '{}' +
  exec setpriv --reuid=node --regid=node --init-groups --no-new-privs "$0" "$@"
fi

# Started as another user (`docker run --user`, a Kubernetes `runAsUser`): nothing can fix the
# ownership here, so fail now rather than on the first write to the database.
if [ ! -w "$DATABASE_DIR" ] || { [ -e "$DATABASE_FILE" ] && [ ! -w "$DATABASE_FILE" ]; }; then
  echo "error: the gateway database at '$DATABASE_FILE' is not writable by uid $(id -u). Make '$DATABASE_DIR' and its contents writable by uid $(id -u), or start the container as root so it can fix the ownership itself." >&2
  exit 1
fi

if [ ! -s "$DATABASE_FILE" ]; then
  cp "$EMPTY_DATABASE_FILE" "$DATABASE_FILE"
fi

exec node ./dist/main.js
