var soap = require('soap');
var http = require('http');
var portfinder = require('portfinder');
const handlers = require('../handlers');
const Utils = require('../utils/utils');
const Promise = require('promise');

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

            Authorize: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.Authorize.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            BootNotification: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                console.log('[SOAPWrapper] BootNotification ');
                handlers.BootNotification.handle(args).then(function(data) {
                    console.log('[SOAPWrapper] BootNotification result: ' + JSON.stringify(data));
                    callback(data);
                });
            },
            StartTransaction: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.StartTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StopTransaction: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.StopTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            Heartbeat: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.Heartbeat.cbHandle(function(data) {
                    callback(data);
                });
            },
            MeterValues: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.MeterValues.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StatusNotification: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.StatusNotification.handle(args).then(function(data) {
                    console.log('[SOAPWrapper] StatusNotification result: ' + JSON.stringify(data));
                    callback(data);
                });
            },
            FirmwareStatusNotification: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.FirmwareStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DiagnosticsStatusNotification: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                handlers.DiagnosticsStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DataTransfer: function(args, callback, headers) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
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
                  console.log('[SOAPWrapper] reset result: ' + JSON.stringify(data));
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

let connections = null;

class SOAPWrapper {
    constructor(mode, log) {
        this.log = log;
        this.mode = mode;
        return this;
    }

    createCentralSystemServer() {
        this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
        this.services = CentralSystemService;
        this.path = '/Ocpp/CentralSystemService';
        this.port = 9220;
        this.createServer();
    }

    createChargePointServer() {
        this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
        this.services = ChargePointService;
        this.path = '/Ocpp/ChargePointService';
        this.port = 9221;
        this.createServer();
    }

    createCentralClient() {
        var self = this;
        var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_centralsystemservice_1.5_final.wsdl';
        var endpoint = 'http://localhost:9220/Ocpp/CentralSystemService';

        return new Promise(function(resolve, reject) {
            self.createClient(url, endpoint).then(function(client) {
                resolve(client);
            }).catch(function(error) {
                reject(error);
            });
        });
    }

    createChargePointClient() {
        var self = this;
        var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_chargepointservice_1.5_final.wsdl';
        //var endpoint = 'http://192.168.0.38:8080/Ocpp/ChargePointService'
        var endpoint = 'http://localhost:9221/Ocpp/ChargePointService'

        return new Promise(function(resolve, reject) {
            self.createClient(url, endpoint).then(function(client) {
                resolve(client);
            }).catch(function(error) {
                reject(error);
            });
        });
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

        return this.soapServer;
    }

    // TODO: must add SOAP headers
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
