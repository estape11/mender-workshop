# Use-case: Auto-name devices when they are provisioned

## Goal
Tag the devices freshly provisioned with a human-readable custom naming.

## Setup
- Instance the DB
```
cd src/database
bash install.sh
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

- Accept and decomission a device to check how the name increases and its saved in the database

## Notes
- Please set correctly the email settings before