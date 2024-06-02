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
DB_USERNAME="mender"
DB_PASS=$(base64 --decode <<<"TWVuZGVyV2ViaG9va3M=")
SCRIPT_DIR=$(realpath "$0" | sed 's|\(.*\)/.*|\1|')
HEADER="Docker | BD $DB_NAME >"

echo $HEADER "Removing previous containers.."
docker stop $DB_NAME 2>/dev/null
docker rm $DB_NAME 2>/dev/null

echo $HEADER "Building container"
docker run \
  --name $DB_NAME \
  --publish 5432:5432 \
  --env POSTGRES_PASSWORD=$DB_PASS \
  --env POSTGRES_USER=$DB_USERNAME \
  --detach postgres

echo $HEADER "Waiting the container to be ready..."
sleep 10

echo $HEADER "Copying files to the container"
docker cp $SCRIPT_DIR/src/ $DB_NAME:/src/

echo $HEADER "Creating the DB"

docker exec -it $DB_NAME psql -U $DB_USERNAME -f /src/tables.psql

echo $HEADER "Adding data and functions to the DB"
docker exec -it $DB_NAME psql -U $DB_USERNAME -f /src/data.psql
docker exec -it $DB_NAME psql -U $DB_USERNAME -f /src/functions.psql
