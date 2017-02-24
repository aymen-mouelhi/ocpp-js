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

## API
### Central System
### Charging Point

## Storage
The project contains an interface to handle the storage in different data bases.
For instance, Firebase can be used to store the data.
