var OCPP =  require('../index.js');

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
