# Use-case: Reject and decommissioning blocked devices

## Goal
Even if a device is accepted in the UI, we can reject and dismiss it automatically if it is on the blocked list

## Setup
- Instance the DB
```
cd src/database
bash install.sh
```

- Generate PAT in the Mender account and save it
```
echo "{\"token\":\"TOKEN\"}" > src/web-server/pat.json
```

- Run the web server
```
cd src/web-server
npm install
npm run start
```

- Expose the web server
```
ngrok http 80
```

- Add the URL provided by ngrok to the Mender Integrations
    [Example](https://docs.mender.io/server-integration/webhooks)

- Add a new device (qemu) MAC address in the database and mark it is as blocked.

- Check the server logs and Mender UI to check the device is being rejected succesfully

## Notes
- To query the DB
```
docker exec -it devices_administration psql postgresql://mender:MenderWebhooks@localhost:5432/devices_administration
```