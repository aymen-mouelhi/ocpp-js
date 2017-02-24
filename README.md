# ocpp-js
Open Charge Point Protocol Implementation in JS

## Installation
`npm install --save ocpp-js`

## Overview

Open Charge Point Protocol (OCPP, <http://ocppforum.net>) is a communication
protocol between multiple charging stations ("charge points") and a single
management software ("central system").

Currently two OCPP versions (1.2 and 1.5) have been released.
There is a draft in progress for a new version (2.0).
Both existing versions use SOAP over HTTP as the RPC/transport protocol:

    +---------------+ soap/http client      soap/http server +----------------+
    |               |--------------------------------------->|                |
    |               |  Operations initiated by ChargePoint   |                |
    |  Charge Point |                                        | Central System |
    |               | soap/http server      soap/http client |                |
    |               |<---------------------------------------|                |
    +---------------+  Operations initiated by CentralSystem +----------------+


## Usage
OCPP JS uses a MongoDB DB to store all the actions received from charge points example: BootNotification, MeterValues, StartTransaction ...
Currently, the project supports MongoDB, firebase and file storage.
In order to specify which DB to use, create a folder config, and then create a file default.json and insert your preferred storage method:

```
{
    "defaultDB": "mongodb",
    "mongodb": {
        "url": "mongodb://localhost/mydb"
    },
    "firebase": {
      "apiKey": "[apiKey]",
      "authDomain": "[authDomain]",
      "databaseURL": "[databaseURL]",
      "storageBucket": "[storageBucket]",
      "messagingSenderId": "[messagingSenderId]"
  }
}
```
You can use Firebase by setting defaultDB : firebase.

To be able to create a Central System, some charging points and a charging point server, you can use this code snippet:

```
var OCPP =  require('ocpp-js');

var options = {
  centralSystem: {
    port: 9220
  },
  chargingPoint: {
    serverURI: 'http://localhost:9221/Ocpp/ChargePointService',
    name: 'Simulator 1'
  },
  chargingPointServer: {
    port: 9221
  }
}

var ocppJS = new OCPP(options);

// Create Central System
var centralSystem = ocppJS.createCentralSystem();

// Create Charging Point Client
var chargingPoint1 = ocppJS.createChargingPoint('http://127.0.0.1:8081/ChargeBox/Ocpp', "chargingPoint1-Simulator");
var chargingPoint2 = ocppJS.createChargingPoint('http://localhost:9221/Ocpp/ChargePointService', "chargingPoint2-Simulator");

// Charging Point Params can be also taken from options
var chargingPoint1 = ocppJS.createChargingPoint();

// Create Charging Point Server
var chargingPointServer = ocppJS.createChargingPointServer(9221);

```
