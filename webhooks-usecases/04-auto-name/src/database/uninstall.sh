#!/bin/bash

# estape11
# Northern Tech 2024

realpath() {
  OURPWD=$PWD
  cd "$(dirname "$1")"
  LINK=$(readlink "$(basename "$1")")
  while [ "$LINK" ]; do
    cd "$(dirname "$LINK")"
    LINK=$(readlink "$(basename "$1")")
  done
  REALPATH="$PWD/$(basename "$1")"
  cd "$OURPWD"
  echo "$REALPATH"
}

DB_NAME="devices_administration"
SCRIPT_DIR=$(realpath "$0" | sed 's|\(.*\)/.*|\1|')
HEADER="Docker | BD $DB_NAME >"

echo $HEADER "Removing previous containers.."
docker stop $DB_NAME 2>/dev/null
docker rm $DB_NAME 2>/dev/null