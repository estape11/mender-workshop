# Use case: Mender add-ons

## Goal
Review the troubleshoot and configure

## Setup

### Troubleshoot
- Get the [`mender-cli` tool](https://docs.mender.io/downloads#mender-cli)
```
wget https://downloads.mender.io/mender-cli/1.12.0/linux/mender-cli
chmod +x mender-cli
cp mender-cli /usr/local/bin/
```

- Login to Mender
```
mender-cli login
```

- List devices available
```
mender-cli devices list
```

- Connect to the remote terminal 
```
mender-cli terminal DEVICE_ID
```

- Port forwarding
```
mender-cli port-forward DEVICE_ID 8000:8000
```

### Configure
- List the available timezones
```
timedatectl list-timezones
```

- Change the timezone value in the "CONFIGURATION" tab in the device information

- Check the change was succesfully applied
```
timedatectl status
```

### Monitor
- Check the device space
```
df -h /
```

- Enable the monitor alert
```
mender-monitorctl enable diskusage root_space
```

- Allocate space to fill the disk space
```
fallocate -l 10G ~/large-file
```

- Check for the monitor alert to get triggered in the UI and in a email notification form

## Resources
[Mender Add-ons](https://docs.mender.io/add-ons)