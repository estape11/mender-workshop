# Use-case: Creating a new virtual device to connect to Mender

## Goal
Create and accept our first virtual Mender-ready device

## Setup
- Login to Mender GUI and get the TENANT_TOKEN

- Set the tenant token and the Mender URL accordingly.
Additionally you can specify the Mender Client version with MENDER_VERSION (i.e mender-3.7.x).
All the available versions [here](https://hub.docker.com/r/mendersoftware/mender-client-qemu/tags)

```
TENANT_TOKEN='eyJhbGc...'
MENDER_URL='https://hosted.mender.io'
MENDER_VERSION='latest'
```

- Run the qemu device
```
docker run -it -p 85:85 -e SERVER_URL=$MENDER_URL \
-e TENANT_TOKEN=$TENANT_TOKEN --pull=always mendersoftware/mender-client-qemu:$MENDER_VERSION
```

- Wait the device to boot and accept it when it reaches the Mender Server

- Get the IP from the virtual devices
```
CONTAINER_ID=$(docker ps  | grep 'mender-client-qemu' | awk '{print $1}')
IP_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "${CONTAINER_ID}")
```

- Alternative, we can create a container to run mender as an example
```
docker run -d --name mender-device --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:rw --cgroupns=host jrei/systemd-ubuntu:20.04
```

- Follow the instructions from [here](https://docs.mender.io/client-installation/install-with-debian-package)