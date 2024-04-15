#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

projectRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
secretKey=$(openssl rand -hex 32)

# Define gateway data directory and create it if it doesn't exist
gatewayDataDir="$projectRoot/apps/gateway/data"
mkdir -p "$gatewayDataDir"
gatewayDbUrl="file:$gatewayDataDir/gateway.db"

# Read .env.template and replace placeholders
envFile="$projectRoot/.env.template"
envContent=$(cat "$envFile")
envContent=${envContent//PROJECT_ROOT=/"PROJECT_ROOT=$projectRoot"}
envContent=${envContent//SECRET_KEY=/"SECRET_KEY=$secretKey"}
envContent=${envContent//GATEWAY_DATABASE_URL=/"GATEWAY_DATABASE_URL=$gatewayDbUrl"}
gatewayApiKey=$(openssl rand -hex 32)
envContent=${envContent//GATEWAY_API_KEY=/"GATEWAY_API_KEY=$gatewayApiKey"}

# # Write the new .env file
envFilePath="$projectRoot/.env"
echo "$envContent" > "$envFilePath"
echo "Done! Successfully generated file: $envFilePath"
