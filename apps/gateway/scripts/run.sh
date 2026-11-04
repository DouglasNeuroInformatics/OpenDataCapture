#!/bin/sh

set -eu

# Creates the database on first start and brings an existing one up to the schema this image was
# built with. `db push` refuses a change that would lose data, which stops the container here.
/app/prisma-cli/node_modules/.bin/prisma db push --skip-generate --schema /app/prisma/schema.prisma

exec node ./dist/main.js
