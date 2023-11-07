#!/bin/sh
# 
# This script is for use in the Docker container. It is
# not intended for use in development. Please start the app
# with the commands in package.json

# Inject environment variables to index.html
./import-meta-env-alpine -x /app/.env.public -p /app/dist/index.html

# Run Caddy server
caddy run --config /etc/caddy/Caddyfile
