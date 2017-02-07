var centralSystemService12 = require('./services/centralSystemService1.2');
var centralSystemService15 = require('./services/centralSystemService1.5');
var centralSystemService16 = require('./services/centralSystemService1.6');
var fs = require('fs');
var http = require('http');
var soap = require('strong-soap').soap;
var path = require('path');

class SoapCentralSystemServer {
    constructor(serverConfig) {
      // Keep local
      // TODO: Check params
      this.serverConfig = serverConfig;
    }

    // Start the server
    start() {
      var ocppVersion = this.serverConfig.ocppVersion;

      // Read the WSDL files
      var centralSystemWsdl12 = fs.readFileSync(
        path.join(__dirname, '/wsdl/OCPP_CentralSystemService1.2.wsdl'), 'UTF-8');
      var centralSystemWsdl15 = fs.readFileSync(
        path.join(__dirname, '/wsdl/OCPP_CentralSystemService1.5.wsdl'), 'UTF-8');
      var centralSystemWsdl16 = fs.readFileSync(
        path.join(__dirname, '/wsdl/OCPP_CentralSystemService1.6.wsdl'), 'UTF-8');

      // Create the HTTP Server
      var serverHttp = http.createServer(function(request, response) {
        console.log("404: Not Found: " + request.url);
      });

      // Listen
      serverHttp.listen(this.serverConfig.port, function() {
        console.log(`SOAP Server started on port ${serverHttp.address().port}`);
      });

      // Create Soap Servers
      // OCPP 1.2 -----------------------------------------
      var soapServer12 = soap.listen(serverHttp, '/OCPP12', centralSystemService12, centralSystemWsdl12);
      // Catch Events
      soapServer12.on("request", function(request, methodName) {
        console.log(`Received OCPP 1.2 request:\n${request}\n${methodName}`);
      });
      soapServer12.log = function(type, data) {
        console.log(`OCPP 1.2 Log:${type}\n${data}`);
      };
      // --------------------------------------------------

      // OCPP 1.5 -----------------------------------------
      var soapServer15 = soap.listen(serverHttp, '/OCPP15', centralSystemService15, centralSystemWsdl15);
      // Catch Events
      soapServer15.on("request", function(request, methodName) {
        console.log(`Received OCPP 1.5 request:\n${request}\n${methodName}`);
      });
      soapServer15.log = function(type, data) {
        console.log(`OCPP 1.5 Log:${type}\n${data}`);
      };
      // --------------------------------------------------

      // OCPP 1.6 -----------------------------------------
      var soapServer16 = soap.listen(serverHttp, '/OCPP16', centralSystemService16, centralSystemWsdl16);
      // Catch Events
      soapServer16.on("request", function(request, methodName) {
        console.log(`Received OCPP 1.6 request:\n${request}\n${methodName}`);
      });
      soapServer16.log = function(type, data) {
        console.log(`OCPP 1.6 Log:${type}\n${data}`);
      };
      // --------------------------------------------------
    }
}

module.exports = SoapCentralSystemServer;
