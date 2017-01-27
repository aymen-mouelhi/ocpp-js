var soap = require('soap');
var http = require('http');
var portfinder = require('portfinder');
const handlers = require('../handlers');
const Utils = require('../utils/utils');

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
            Heartbeat: function(args, callback, headers) {
                console.log('Headers: ' + JSON.stringify(headers));
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
            UnlockConnector: function(args, callback) {
                handlers.UnlockConnector.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            Reset: function(args, callback) {
                handlers.Reset.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            ChangeAvailability: function(args, callback) {
                handlers.ChangeAvailability.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            GetDiagnostics: function(args, callback) {
                handlers.GetDiagnostics.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            ClearCache: function(args, callback) {
                handlers.ClearCache.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            UpdateFirmware: function(args, callback) {
                handlers.UpdateFirmware.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            ChangeConfiguration: function(args, callback) {
                handlers.ChangeConfiguration.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            RemoteStartTransaction: function(args, callback) {
                handlers.RemoteStartTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            RemoteStopTransaction: function(args, callback) {
                handlers.RemoteStopTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            CancelReservation: function(args, callback) {
                handlers.CancelReservation.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DataTransfer: function(args, callback) {
                handlers.DataTransfer.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            GetConfiguration: function(args, callback) {
                handlers.GetConfiguration.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            GetLocalListVersion: function(args, callback) {
                handlers.GetLocalListVersion.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            ReserveNow: function(args, callback) {
                handlers.ReserveNow.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            SendLocalList: function(args, callback) {
                handlers.SendLocalList.cbHandle(args, function(data) {
                    callback(data);
                });
            }
        }
    }
}

// TODO: singleton connections array to store list of connected clients
let connections = null;

class SOAPWrapper {
    constructor(mode, log) {
        this.log = log;
        this.mode = mode;
        /*
        if (mode === 'server') {
            this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
            this.services = CentralSystemService;
            this.path = '/Ocpp/CentralSystemService';
            this.port = 9220;
            this.createServer();
        } else {
            this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
            this.services = ChargePointService;
            this.path = '/Ocpp/ChargePointService';
            this.port = 9221;
            this.createClient();
            this.createServer();
        }
        */

        return this;
    }

    createCentralSystemServer(){
      this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
      this.services = CentralSystemService;
      this.path = '/Ocpp/CentralSystemService';
      this.port = 9220;
      this.createServer();
    }

    createChargePointServer(){
      this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
      this.services = ChargePointService;
      this.path = '/Ocpp/ChargePointService';
      this.port = 9221;
      this.createServer();
    }

    createCentralClient(){
      var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_centralsystemservice_1.5_final.wsdl';
      var endpoint = 'http://192.168.0.38:9220/Ocpp/CentralSystemService';
      this.createClient(url, endpoint);
    }

    createChargePointClient(){
      var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_chargepointservice_1.5_final.wsdl';
      var endpoint = 'http://192.168.0.38:9220/Ocpp/ChargePointService'
      this.createClient(url, endpoint);
    }


    // TODO: must add SOAP headers
    createServer() {
        var self = this;
        var name = self.path.replace('/Ocpp/', '').replace('Service', '');

        // http server
        var server = http.createServer(function(request, response) {
            response.end(self._log() + " 404: Not Found: " + request.url);
        });

        //TODO Check if port is used
        server.listen(this.port, function() {
            console.log(self._log() + ' ' + name + ' Server is listening on port ' + self.port);
        });

        // SOAP Server listener
        this.soapServer = soap.listen(server, this.path, this.services, this.xml);

        if (this.log) {
            this.soapServer.log = function(type, data) {
                // type is 'received' or 'replied'
                console.log(self._log() + ' [' + type + '] ' + JSON.stringify(data));
            };
        }
    }

    // TODO: must add SOAP headers
    createClient(url, endpoint) {
        var self = this;
        // var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_centralsystemservice_1.5_final.wsdl';
        // var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_chargepointservice_1.5_final.wsdl';

        soap.createClient(url, {
            endpoint: endpoint
        }, function(err, client) {
            if (err) {
                console.log(self._log() + ' ERROR ' + err);
            }
            if (client) {
                console.log(client.describe());

                client.addSoapHeader({
                    'chargeBoxIdentity': "EVlink"
                });
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
                    if (err) {
                        console.log(self._log() + ' ERROR ' + err);
                    } else {
                        console.log(result);
                    }
                });
            } else {
                console.log(self._log() + 'soap client is not created ! ');
            }
        });
    }

    remoteAction(action, chargeBoxIdentity) {

        if (chargeBoxIdentity) {
          if(this.soapServer){
            this.soapServer.addSoapHeader('<ns:chargeBoxIdentity>EVLink-3</ns:chargeBoxIdentity>');
            /*
            this.soapServer.addSoapHeader({
                'chargeBoxIdentity': chargeBoxIdentity
            }, 'chargeBoxIdentity', 'tns', 'urn://Ocpp/Cp/2012/06/');
            */
          } else {
            console.log(self._log() + ' ERROR: soapServer is not initialized !');
          }
        } else {
            console.log(self._log() + ' ERROR: ChargeBoxIdentity was\'t specified !');
        }

        console.log('soapServer ' + this.soapServer);

        switch (action) {
            case 'some action':

                break;
            default:
              // TODO: HTTP request
              this.soapServer.Reset(function(err, result) {
                    if (err) {
                        console.log(self._log() + ' ERROR while resetting' + err);
                    } else {
                        console.log('Post Reset:' + result);
                    }
                });
                break;
        }
    }

    _log() {
        return Utils.dateToString(new Date());
    }
}

module.exports = SOAPWrapper;
