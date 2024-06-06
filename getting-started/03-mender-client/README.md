# Use case: Check mender-client related files and logs

# Goal
Review the directories and important files for mender-client and its logs

# Steps
- In case `tree` command is not implemented, you can specify a simple version with
```
tree() (
    [ -d "$1" ] && { dir="$1"; shift; } || dir='.'
    find "$dir" "$@" | sed -e 's@/@|@g;s/^\.|//;s/[^|][^|]*|/ |/g;/^[. |]*$/d'
)
```

- List the `/etc/mender` folder

```
tree /etc/mender/
| | |scripts
| | | |version
| | |mender.conf
| | |mender-connect.conf
```

- List the `/var/lib/mender` and `tree /var/lib/mender-configure` (actually `/data/mender`) folder
```
ls -lah /var/lib/ | grep mender
lrwxrwxrwx  1 root       root         12 Mar  9  2018 mender -> /data/mender
lrwxrwxrwx  1 root       root         22 Mar  9  2018 mender-configure -> /data/mender-configure

tree /var/lib/mender/
| | | |mender.conf
| | | |mender-agent.pem
| | | |device_type
| | | |mender-store
| | | |modules
| | | | |v3
| | | | | |payloads
| | | | | | |0000
| | | |mender-store-lock
| | | |deployments.0000.2222ae11-40e1-4325-8fb6-52244335d9e6.log

tree /var/lib/mender-configure/
| | | |device-config.json
| | | |device-config-reported.sha256
```

- List the `/usr/share/mender` folder
```
tree /usr/share/mender/
| | | |identity
| | | | |mender-device-identity
| | | |inventory
| | | | |mender-inventory-geo
| | | | |mender-inventory-bootloader-integration
| | | | |mender-inventory-hostinfo
| | | | |mender-inventory-docker-ip
| | | | |mender-inventory-provides
| | | | |mender-inventory-network
| | | | |mender-inventory-os
| | | | |mender-inventory-rootfs-type
| | | | |mender-inventory-update-modules
| | | | |mender-inventory-mender-configure
| | | |modules
| | | | |v3
| | | | | |script
| | | | | |directory
| | | | | |rootfs-image
| | | | | |deb
| | | | | |single-file
| | | | | |mender-configure
| | | | | |rpm
| | | | | |docker
```

- Get the service status (mender-client 4.0 or later)
```
systemctl status mender-authd
systemctl status mender-updated
journalctl -u mender-authd
journalctl -u mender-updated
```

- Get the service status (mender-client go-lang)
```
systemctl status mender-client
journalctl -u mender-client
```

### Useful `mender-cli` commands
- Get the JWT from the device
```
JWT=$(dbus-send --system --dest=io.mender.AuthenticationManager --print-reply /io/mender/AuthenticationManager io.mender.Authentication1.GetJwtToken | grep string | head -1 | awk '{split($0,a,"string"); print a[2]}' | tr -d \" | tr -d \ )

jq -R 'split(".") | .[1] | @base64d | fromjson' <<< "$JWT"
```

- Send manually the inventory
```
mender-update send-inventory
```

- Manually check for updates
```
mender-update send-inventory
```

- Check the software provides
```
mender-update show-provides
```  

## Resources
- [identity](https://docs.mender.io/client-installation/identity)

- [inventory](https://docs.mender.io/client-installation/inventory)

- [configuration file](https://docs.mender.io/client-installation/configuration-file)

- [update modules](https://docs.mender.io/client-installation/use-an-updatemodule)