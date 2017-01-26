var soap = require('soap');
var http = require('http');
const handlers = require('../handlers');
const Utils = require('../utils/utils');
var port = 9000;

var CentralSystemService = {
    CentralSystemService: {
        CentralSystemServiceSoap12: {
            MyFunction: function(args) {
                return {
                    name: args.name
                };
            },

            // This is how to define an asynchronous function.
            MyAsyncFunction: function(args, callback) {
                // do some work
                callback({
                    name: args.name
                });
            },

            // This is how to receive incoming headers
            HeadersAwareFunction: function(args, cb, headers) {
                return {
                    name: headers.Token
                };
            },

            // You can also inspect the original `req`
            reallyDetailedFunction: function(args, cb, headers, req) {
                console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                return {
                    name: headers.Token
                };
            },

            Authorize: function(args, callback) {
                handlers.Authorize.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            BootNotification: function(args, callback) {
                handlers.BootNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StartTransaction: function(args, callback) {
                handlers.StartTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StopTransaction: function(args, callback) {
                handlers.StopTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            Heartbeat: function(args, callback) {
                handlers.Heartbeat.cbHandle(function(data) {
                    callback(data);
                });
            },
            MeterValues: function(args, callback) {
                handlers.MeterValues.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StatusNotification: function(args, callback) {
                handlers.StatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            FirmwareStatusNotification: function(args, callback) {
                handlers.FirmwareStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DiagnosticsStatusNotification: function(args, callback) {
                handlers.DiagnosticsStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DataTransfer: function(args, callback) {
                handlers.DataTransfer.cbHandle(args, function(data) {
                    callback(data);
                });
            }
        }
    }
};

var ChargePointService = {
    ChargePointService: {
        ChargePointServiceSoap12: {

        }
    }
}

class SOAPWrapper {
    constructor(mode, log) {
        this.log = log;
        this.mode = mode;

        if (mode === 'server') {
            this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
            this.services = CentralSystemService;
            this.path = '/Ocpp/CentralSystemService';
            this.port = 9000;
            this.createServer();
        } else {
            this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
            this.services = ChargePointService;
            this.path = '/Ocpp/ChargePointService';
            this.port = 9001;
            this.createClient();
            this.createServer();
        }
    }

    // TODO: must add SOAP headers
    createServer() {
      var self = this;
        // http server
        var server = http.createServer(function(request, response) {
            response.end(self._log() + " 404: Not Found: " + request.url);
        });

        //TODO Check if port is used
        server.listen(this.port, function() {
            console.log(self._log() + self.path.replace('/Ocpp/', '') +' Server is listening on port ' + this.port);
        });

        // SOAP Server listener
        var soapServer = soap.listen(server, this.path, this.services, this.xml);

        if (this.log) {
            soapServer.log = function(type, data) {
                // type is 'received' or 'replied'
                console.log(self._log() + ' [' + type + '] ' + JSON.stringify(data));
            };
        }
    }

    // TODO: must add SOAP headers
    createClient() {
      var self = this;
      var xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
      var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_centralsystemservice_1.5_final.wsdl';

      soap.createClient(url, { endpoint: 'http://192.168.0.38:9220/Ocpp/CentralSystemService'}, function(err, client) {
        if(client){
          //console.log(client.describe());
          /*
          client.BootNotification(args, function(err, result) {
            if(err){
              console.log(err);
            }else{
              console.log(result);
            }
          });
          */
          client.Heartbeat(function(err, result) {
            if(err){
              console.log(self._log() + ' ERROR ' +err);
            }else{
              console.log(result);
            }
          });
        }else{
          console.log(self._log() + 'soap client is not created ! ');
        }
      });
    }

    _log(){
      return Utils.dateToString(new Date());
    }
}

module.exports = SOAPWrapper;
