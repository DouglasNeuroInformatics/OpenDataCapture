#!/bin/sh

set -eu

DATABASE_FILE=${GATEWAY_DATABASE_URL#file:}
EMPTY_DATABASE_FILE="/app/gateway.tmpl.db"

if [ ! -s "$DATABASE_FILE" ]; then
  cp "$EMPTY_DATABASE_FILE" "$DATABASE_FILE"
fi

exec node ./dist/main.js
