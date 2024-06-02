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
const { exit } = require("process");

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
          let temp = element.split("=");
          if (temp[0] === "PORT") {
            port = parseInt(temp[1]);
          } else if (temp[0] === "SECURE_PORT") {
            securePort = parseInt(temp[1]);
          } else if (temp[0] === "FORCE_SSL") {
            if (temp[1] === "false") {
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
    Log("Error: Fail to load settings", MODULE);
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

// Valores configurables
let port = 80;
let securePort = 443;
let rutaPublica = `${__dirname}/public`;
let forceSSL = true;
let rutaEntorno = "";

// Carga de configuraciones
if (argv.c !== undefined) {
  LoadSettings(argv.c);
} else if (argv.conf_file !== undefined) {
  LoadSettings(argv.conf_file);
} else if (argv.test !== undefined || argv.t !== undefined) {
  console.log("SRV0000");
  process.exit(0);
}

// certificates HTTPS
const certificates = LoadCertificates(rutaEntorno);

// Server instance
const server = express();
const ddos = new Ddos({ burst: 500, limit: 5000 });

// Configuracion del server
if (forceSSL === true) {
  server.use(forceSsl);
}

server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
server.use(ddos.express);
server.use(staticFileMiddleware);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(function (req, res, next) {
  res.setTimeout(150000, function () {
    // time-out de 00:02:30
    Log("WARNING: Time-out", MODULE);
    //res.sendStatus(408);
    res.status(408);
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
    if (req.body.type) {
        Log(`Received: ${req.body.type}`, MODULE);
        switch(req.body.type) {
            case "device-provisioned":
                break;
            case "device-decommissioned":
                break;
            case "device-status-changed":
                break;
            default:
                Log(`WARNING: Type not recognized`, MODULE);
            }
    } else {
        Log(`WARNING: Type not received`, MODULE);
    }

    res.status(200);
});
  
// Reject any other request
server.get("*", function (req, res) {
  Log(`[${getIpAddress(req)}, ${req.get("User-Agent")}] GET: Error 405`, MODULE);
  res.status(405).send({ message: "Request not found" });
});

server.put("*", function (req, res) {
  Log(`[${getIpAddress(req)}, ${req.get("User-Agent")}] PUT: Error 405`, MODULE);
  res.status(405).send({ message: "Request not found" });
});

server.patch("*", function (req, res) {
  Log(`[${getIpAddress(req)}, ${req.get("User-Agent")}] PATCH: Error 405`, MODULE);
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
  Log(`[${getIpAddress(req)}, ${req.get("User-Agent")}] HEAD: Error 405`, MODULE);
  res.status(405).send({ message: "Request not found" });
});
