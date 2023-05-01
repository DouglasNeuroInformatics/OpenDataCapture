#!/bin/bash

WORKSPACE=$1
ARGS="${@:2}"

case $WORKSPACE in
  client|server)
    yarn workspace "@douglasneuroinformatics/$WORKSPACE" $ARGS
    ;;
  *)
    echo "Usage: $1 {client|server}" && exit 1
    ;;
esac
