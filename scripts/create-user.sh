#!/bin/bash
# 
# Create a new user
# Usage: create-user.sh <accessToken> <username> <password> <basePermissionLevel>

set -euo pipefail

API_URL="https://datacapture.douglasneuroinformatics.ca/api"

curl --location "${API_URL}/v1/users" \
--header "Content-Type: application/x-www-form-urlencoded" \
 --header "Authorization: Bearer $1" \
--data-urlencode "username=$2" \
--data-urlencode "password=$3" \
--data-urlencode "basePermissionLevel=$4" \
