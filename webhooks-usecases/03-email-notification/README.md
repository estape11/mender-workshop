# Use-case: Notify via email when a device is accepted or decommissioned

## Goal
We want to notify the administrator every time a device is provisioned and decommissioned in a email.

## Setup
- Generate your email provider PAT equivalent and setup the server.conf accordingly
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

- Accept and decomission a device to receive the notifiacions via email

## Notes
- Please set correctly the email settings before