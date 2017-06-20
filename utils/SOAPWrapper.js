var soap = require('strong-soap').soap;
var http = require('http');
var path = require('path');
var portfinder = require('portfinder');
const Utils = require('../utils/utils');
const Promise = require('promise');

var CentralSystemService = require('./CentralSystemService');
var ChargePointService = require('./ChargePointService');

let connections = null;

class SOAPWrapper {
    constructor(mode, log) {
        this.log = log;
        this.mode = mode;
        return this;
    }

    createCentralSystemServer(port=9220) {
        this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
        this.services = CentralSystemService;
        this.path = '/Ocpp/CentralSystemService';
        this.port = port;
        this.createServer();
    }

    createChargePointServer(port=9221) {
        this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
        this.services = ChargePointService;
        this.path = '/Ocpp/ChargePointService';
        this.port = port;
        this.createServer();
    }

    createCentralClient(endpoint) {
        var self = this;
        var url = require('path').resolve(__dirname, '../wsdl/ocpp_centralsystemservice_1.5_final.wsdl');
        var endpoint = endpoint || 'http://localhost:9220/Ocpp/CentralSystemService';

        return new Promise(function(resolve, reject) {
            self.createClient(url, endpoint).then(function(client) {
                resolve(client);
            }).catch(function(error) {
                reject(error);
            });
        });
    }

    createChargePointClient(endpoint) {
        var self = this;
        var url = require('path').resolve(__dirname, '../wsdl/ocpp_chargepointservice_1.5_final.wsdl');
        var endpoint = endpoint || 'http://127.0.0.1:8080/Ocpp/ChargePointService';
        console.log(`[SOAPWrapper-createChargePointClient] endpoint: ${endpoint} `);

        return new Promise(function(resolve, reject) {
            self.createClient(url, endpoint).then(function(client) {
                resolve(client);
            }).catch(function(error) {
                reject(error);
            });
        });
    }

    createServer() {
        var self = this;
        var name = self.path.replace('/Ocpp/', '').replace('Service', '');

        // http server
        var server = http.createServer(function(request, response) {
            response.end(self._log() + " 404: Not Found: " + request.url);
        });

        //TODO Check if port is used [Issue #28]
        server.listen(this.port, function() {
            console.log(self._log() + ' ' + name + ' Server is listening on port ' + self.port);
            var message = '/***********************************************************************/' + require("os").EOL;
            require('fs').appendFile(require('path').resolve(__dirname, '../logs/soap.log'), message, function (err) {
              if (err) throw err;
            });
        });

        // SOAP Server listener
        this.soapServer = soap.listen(server, this.path, this.services, this.xml);

        if (this.log) {
            var prettyData = require('pretty-data').pd;

            this.soapServer.log = function(type, data) {
                // type is 'received' or 'replied'
                var output;
                if(data[0] === '<'){
                  // xml
                  output = prettyData.xml(data);
                }else{
                  output = JSON.stringify(data);
                }
                var message = self._log() + ' [' + type + '] ' + output + require("os").EOL;
                console.log(message);
                require('fs').appendFile(require('path').resolve(__dirname, '../logs/soap.log'), message, function (err) {
                  if (err) throw err;
                });
            };
        }

        return this.soapServer;
    }

    createClient(url, endpoint) {
        var self = this;

        return new Promise(function(resolve, reject) {
            soap.createClient(url, {
                endpoint: endpoint
            }, function(err, client) {
                if (err) {
                    console.log(self._log() + ' ERROR ' + err);
                    reject(err);
                } else {
                    resolve(client)
                }
            });
        });
    }

    _log() {
        return Utils.dateToString(new Date());
    }
}

module.exports = SOAPWrapper;
