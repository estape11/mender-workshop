# Use-case: Basic web server to received event information

## Goal
Validate which event information we receive in each webhook call.

## Setup
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

- Add a new device (qemu), accept it and dismiss it and check the server logs.

## Notes
- Check also the activity log from the webhook integrations in [integrations](https://hosted.mender.io/ui/settings/integrations).