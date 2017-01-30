const handlers = require('../handlers');

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

module.exports = CentralSystemService;
