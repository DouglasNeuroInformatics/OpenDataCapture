#!/bin/bash
# 
# Print the access token to stdout
# Usage: get-access-token.sh <username> <password>

set -euo pipefail

API_URL="https://datacapture.douglasneuroinformatics.ca/api"

curl -s --location "${API_URL}/v1/auth/login" \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "username=$1" \
  --data-urlencode "password=$2" \
  | jq -r ".accessToken"