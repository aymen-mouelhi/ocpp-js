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

    +---------------+ soap/http client      soap/http server +---------------+
    |               |--------------------------------------->|               |
    |               |  Operations initiated by ChargePoint   |               |
    |  ChargePoint  |                                        | CentralSystem |
    |               | soap/http server      soap/http client |               |
    |               |<---------------------------------------|               |
    +---------------+  Operations initiated by CentralSystem +---------------+


## Usage

The project can be used to create simulators.

### Create Central System Server
```
var CentralSystem = require('../entities/CentralSystem.js');

// 9220 is the default port
var server = new CentralSystem('9220');
```

### Create Charging Point Client
```
const ChargingPoint = require('../entities/ChargingPoint');

var chargingPoint1 = new ChargingPoint('http://127.0.0.1:8081/ChargeBox/Ocpp', "chargingPoint1-Simulator");
var chargingPoint2 = new ChargingPoint('http://localhost:9221/Ocpp/ChargePointService', "chargingPoint2-Simulator");
```

### Create Charging Point Server


## API
### Central System
### Charging Point

## Storage
The project contains an interface to handle the storage in different data bases.
For instance, Firebase can be used to store the data.

## Handlers
