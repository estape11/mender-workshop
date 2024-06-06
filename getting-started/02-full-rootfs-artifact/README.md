# Use case: Creating a golden image artifact (full rootfs)

## Goal
Modify the rootfs of the virtual device, make a snapshot and deploy it to a differen device

## Setup
- Set the needed variables, this command assumed that `$IP_ADDRESS` and `$DEVICE_TYPE` are already set
```
USER="root"
SSH_PORT=8822
ADDR=$IP_ADDRESS":"$SSH_PORT
ARTIFACT_NAME="full-system-1.1"
FILE_NAME="golden-image-v1.1.mender"

mender-artifact write rootfs-image --file ssh://${USER}@${ADDR} \
                                   --artifact-name $ARTIFACT_NAME \
                                   --software-version 1.1 \
                                   --output-path $FILE_NAME \
                                   --device-type $DEVICE_TYPE
```

- Upload the artifact and deploy it to a different virtual device