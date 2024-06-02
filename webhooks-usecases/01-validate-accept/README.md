# Use-case: External validation and auto-accept

## Goal
Handle the call when a device on pending state connects to the Mender Server, validate internally the device identity and accept if it is the case.

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
npm run start
```

- Expose the web server
```
ngrok http 80
```

- Add the URL provided by ngrok to the Mender Integrations
    [Example](https://docs.mender.io/server-integration/webhooks)

## Notes
- To query the DB
```
docker exec -it devices_administration psql postgresql://mender:MenderWebhooks@localhost:5432/devices_administration
```