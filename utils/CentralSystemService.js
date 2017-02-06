const handlers = require('../handlers');

var CentralSystemService = {
    CentralSystemService: {
        CentralSystemServiceSoap12: {
            Authorize: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;
                
                handlers.Authorize.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            BootNotification: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                console.log('[SOAPWrapper] BootNotification ');
                handlers.BootNotification.handle(args).then(function(data) {
                    console.log('[SOAPWrapper] BootNotification result: ' + JSON.stringify(data));
                    callback(null, data);
                });
            },
            StartTransaction: function(args, callback, headers, req) {
                console.log('Headers: ' + JSON.stringify(headers));
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.StartTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StopTransaction: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.StopTransaction.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            Heartbeat: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.Heartbeat.cbHandle(function(data) {
                    callback(data);
                });
            },
            MeterValues: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.MeterValues.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            StatusNotification: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.StatusNotification.cbHandle(args, function(data) {
                  data = data || {}
                  console.log('[SOAPWrapper] StatusNotification result: ' + JSON.stringify(data));
                  callback(data);
                });
            },
            FirmwareStatusNotification: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.FirmwareStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DiagnosticsStatusNotification: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.DiagnosticsStatusNotification.cbHandle(args, function(data) {
                    callback(data);
                });
            },
            DataTransfer: function(args, callback, headers, req) {
                args.chargeBoxIdentity = headers.chargeBoxIdentity;
                args.remoteAddress = req.connection.remoteAddress;

                handlers.DataTransfer.cbHandle(args, function(data) {
                    callback(data);
                });
            }
        }
    }
};

module.exports = CentralSystemService;
