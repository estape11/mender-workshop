/*
*******************************************************************
            Basic Web Server - Mender Webhooks
*******************************************************************
	Programmer: Esteban Aguero Perez (estape11)
	Language: JavaScript
	Version: 1.0.0
	Date: 02/06/2024
                        Northern Tech
*******************************************************************
*/

// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const forceSsl = require("express-force-ssl");
const https = require("https");
const http = require("http");
const argv = require("minimist")(process.argv.slice(2));
const path = require("path");
const helmet = require("helmet");
const Ddos = require("ddos");
const moment = require("moment");
const axios = require("axios");
const { exit } = require("process");
const pat = require("./pat.json");
const { Pool } = require("pg");
const atob = require("atob");

const MODULE = "Basic Webhook Server";
const BLOCKED_LIST = [".env", ".php", ".aspx", ".txt", "..", ".git", "config"];

function Log(message, module) {
  console.log(
    `${moment().format("YYYY/MM/DD HH:mm:ss")} [${module}] > ${message}`
  );
}

// Load basic settings
function LoadSettings(archivo) {
  let result = false;
  try {
    let contents = fs.readFileSync(archivo, "utf8");
    if (contents !== undefined) {
      Log(`Settings loaded from: ${archivo}`, MODULE);
      let res = contents.split("\n");
      res.forEach((element) => {
        if (element[0] !== "#" && element !== "") {
          let keyValue = element.split("=");
          if (keyValue[0] === "PORT") {
            port = parseInt(keyValue[1]);
          } else if (keyValue[0] === "SECURE_PORT") {
            securePort = parseInt(keyValue[1]);
          } else if (keyValue[0] === "DB_IP") {
            addrDB = keyValue[1];
          } else if (keyValue[0] === "DB_PORT") {
            portDB = keyValue[1];
          } else if (keyValue[0] === "DB_NAME") {
            nameDB = atob(keyValue[1]);
          } else if (keyValue[0] === "DB_USER") {
            userDB = atob(keyValue[1]);
          } else if (keyValue[0] === "DB_PASS") {
            passDB = atob(keyValue[1]);
          } else if (keyValue[0] === "FORCE_SSL") {
            if (keyValue[1] === "false") {
              forceSSL = false;
            } else {
              forceSSL = true;
            }
          }
        }
      });
      Log("Settings loaded succesfully", MODULE);
      result = true;
    }
  } catch (ex) {
    Log(`Error: Failed to load settings > ${ex}`, MODULE);
  }

  if (!result) {
    Log("Warning: Using default settings", MODULE);
  }

  return result;
}

function getIpAddress(req) {
  let ips = (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    ""
  ).split(",");
  return ips[0].trim();
}

// Carga los certificatess
function LoadCertificates(envPath) {
  try {
    privateKey = fs.readFileSync(
      `${envPath}live/encryption/privkey.pem`,
      "utf8"
    );
    certificate = fs.readFileSync(`${envPath}live/encryption/cert.pem`, "utf8");
    ca = fs.readFileSync(`${envPath}live/encryption/chain.pem`, "utf8");
    return {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };
  } catch (err) {
    Log(`Utilidades: Error al cargar el certificates. ${err}`, MODULE);
    return undefined;
  }
}

// Settings
let port = 80;
let securePort = 443;
let forceSSL = true;
let userDB = "mender";
let passDB = "NaN";
let nameDB = "devices_administration";
let addrDB = "localhost";
let portDB = 5432;
let envPath = "./";
let menderURL = "https://hosted.mender.io";
let showRequestData = false;

// Load settings
if (argv.c !== undefined) {
  LoadSettings(argv.c);
} else if (argv.conf_file !== undefined) {
  LoadSettings(argv.conf_file);
} else if (argv.test !== undefined || argv.t !== undefined) {
  console.log("SRV0000");
  process.exit(0);
}

// Database instance connection
pgConnetion = new Pool({
  host: addrDB,
  user: userDB,
  password: passDB,
  database: nameDB,
  port: portDB,
});

// Database test
pgConnetion
  .query("SELECT NOW()")
  .then((response) => {
    Log("Database test succesfully", MODULE);
  })
  .catch((err) => {
    Log("WARNING: Connection to database failed", MODULE);
  });

// certificates HTTPS
let certificates = undefined;

// Server instance
const server = express();
const ddos = new Ddos({ burst: 500, limit: 5000 });

// Server configuration
if (forceSSL === true) {
  certificates = LoadCertificates(envPath);
  server.use(forceSsl);
}

server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
server.use(ddos.express);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(function (req, res, next) {
  res.setTimeout(150000, function () {
    Log("WARNING: Time-out", MODULE);
    res.status(408).send("timeout");
  });
  next();
});

if (certificates !== undefined) {
  https
    .createServer(certificates, server)
    .listen(securePort, () => {
      Log(`Secure server started | port: ${securePort}`, MODULE);
    })
    .on("error", (err) => {
      Log(`Error: Secure no failed to start > ${err}`, MODULE);
    });
}

http
  .createServer(server)
  .listen(port, () => {
    Log(`Server started | port: ${port}`, MODULE);
  })
  .on("error", (err) => {
    Log(`Error: Failed to start server > ${err}`, MODULE);
    exit(1);
  });

// Read data from the webhook call
server.post("*", function (req, res) {
  // Read the event information
  const payload = req.body;
  const headers = req.headers;

  if (showRequestData) {
    console.log(JSON.stringify(payload));
    console.log(JSON.stringify(headers));
  }

  if (payload.type) {
    Log(`New event received: ${payload.type}`, MODULE);
    switch (payload.type) {
      // A new accepted device event was triggered
      case "device-provisioned":
        // Check if the device is in the blocked list
        let authSets = payload.data.auth_sets;
        for (let i = 0; i < authSets.length; i++) {
          pgConnetion
            .query(`SELECT * FROM IsABlockedDevice ($1::varchar)`, [
              authSets[i].identity_data.mac,
            ])
            .then((responseBlockedDevice) => {
              if (
                responseBlockedDevice.rows &&
                responseBlockedDevice.rows.length > 0
              ) {
                let deviceIsBlocked = responseBlockedDevice.rows[0].Blocked;
                if (deviceIsBlocked) {
                  axios
                    .delete(
                      `${menderURL}/api/management/v2/devauth/devices/${payload.data.id}/auth/${authSets[i].id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${pat.token}`,
                        },
                      }
                    )
                    .then((res) => {
                      Log(
                        `WARNING: Rejecting device auth_set > ${payload.data.id} (${authSets[i].id})`,
                        MODULE
                      );
                    })
                    .catch((err) => {
                      Log(
                        `Error: Unable to connect to Mender Server > ${err}`,
                        MODULE
                      );
                    });
                } else {
                  Log(
                    `Device is not in the blockedlist > ${payload.data.id}`,
                    MODULE
                  );
                }
              }
            })
            .catch((err) => {
              Log(
                `Error: Unable to perform query to the database > ${err}`,
                MODULE
              );
            });
        }
        break;
      // A device was dismissed
      case "device-decommissioned":
        break;
      // A status change was triggered to a device
      case "device-status-changed":
        break;
      default:
        Log(`WARNING: Type not recognized`, MODULE);
    }
  } else {
    Log(`WARNING: Type not received`, MODULE);
  }
  res.status(200).send("OK");
});

// Reject any other request
server.get("*", function (req, res) {
  Log(
    `[${getIpAddress(req)}, ${req.get("User-Agent")}] GET: Error 405`,
    MODULE
  );
  res.status(405).send({ message: "Request not found" });
});

server.put("*", function (req, res) {
  Log(
    `[${getIpAddress(req)}, ${req.get("User-Agent")}] PUT: Error 405`,
    MODULE
  );
  res.status(405).send({ message: "Request not found" });
});

server.patch("*", function (req, res) {
  Log(
    `[${getIpAddress(req)}, ${req.get("User-Agent")}] PATCH: Error 405`,
    MODULE
  );
  res.status(405).send({ message: "Request not found" });
});

server.delete("*", function (req, res) {
  Log(
    `[${getIpAddress(req)}, ${req.get("User-Agent")}] DELETE: Error 405`,
    MODULE
  );
  res.status(405).send({ message: "Request not found" });
});

server.head("*", function (req, res) {
  Log(
    `[${getIpAddress(req)}, ${req.get("User-Agent")}] HEAD: Error 405`,
    MODULE
  );
  res.status(405).send({ message: "Request not found" });
});
