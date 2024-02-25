#!/usr/bin/env bash
# 
# First, generate an access token on GitHub (ssh is not supported)
# echo $PASSWORD | docker login ghcr.io -u USERNAME --password-stdin

docker push ghcr.io/douglasneuroinformatics/open-data-capture-api:latest
docker push ghcr.io/douglasneuroinformatics/open-data-capture-gateway:latest
docker push ghcr.io/douglasneuroinformatics/open-data-capture-playground:latest
docker push ghcr.io/douglasneuroinformatics/open-data-capture-web:latest
