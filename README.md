# Mender Workshop resources

## Requirements
- [HM account](https://hosted.mender.io) (can be aliases)
- [docker](https://www.docker.com/)
- [node/npm](https://nodejs.org/en)
- [ngrok account](https://ngrok.com/) (to temporarily expose the server)
- [mender-artifact](https://docs.mender.io/downloads#mender-artifact)

## Getting Started
- [Create a mender-ready virtual device](mender-workshop/getting-started/00-create-virtual-device/README.md)
- [Generating and deployment of artifacts](mender-workshop/getting-started/01-generating-artifacts/README.md)
- [Mender client overview](mender-workshop/getting-started/03-mender-client/README.md)
- [Mender add-ons](mender-workshop/getting-started/04-addons/README.md)

## Webhooks use-cases
- [Review the request data sent in the webhook call](webhooks-usecases/00-basic-event-receiver/README.md)
- [Validate and auto-accept devices](webhooks-usecases/01-validate-accept/README.md)
- [Auto reject and dismiss devices from the blockedlist](webhooks-usecases/02-blocklist/README.md)
- [Email notifications when devices changes status](webhooks-usecases/03-email-notification/README.md)
- [Auto-name devices that connects Mender](webhooks-usecases/04-auto-name/README.md)