const handlers = require('../handlers');

var ChargePointService = {
    ChargePointService: {
        ChargePointServiceSoap12: {
            UnlockConnector: function(args, callback) {
                handlers.UnlockConnector.handle(args).then(function(data) {
                    callback(data);
                });
            },
            Reset: function(args, callback) {
                handlers.Reset.handle(args).then(function(data) {
                  console.log('[SOAPWrapper] reset result: ' + JSON.stringify(data));
                    callback(data);
                });
            },
            ChangeAvailability: function(args, callback) {
                handlers.ChangeAvailability.handle(args).then(function(data) {
                    callback(data);
                });
            },
            GetDiagnostics: function(args, callback) {
                handlers.GetDiagnostics.handle(args).then(function(data) {
                    callback(data);
                });
            },
            ClearCache: function(args, callback) {
                handlers.ClearCache.handle(args).then(function(data) {
                    callback(data);
                });
            },
            UpdateFirmware: function(args, callback) {
                handlers.UpdateFirmware.handle(args).then(function(data) {
                    callback(data);
                });
            },
            ChangeConfiguration: function(args, callback) {
                handlers.ChangeConfiguration.handle(args).then(function(data) {
                    callback(data);
                });
            },
            RemoteStartTransaction: function(args, callback) {
                handlers.RemoteStartTransaction.handle(args).then(function(data) {
                    callback(data);
                });
            },
            RemoteStopTransaction: function(args, callback) {
                handlers.RemoteStopTransaction.handle(args).then(function(data) {
                    callback(data);
                });
            },
            CancelReservation: function(args, callback) {
                handlers.CancelReservation.handle(args).then(function(data) {
                    callback(data);
                });
            },
            DataTransfer: function(args, callback) {
                handlers.DataTransfer.handle(args).then(function(data) {
                    callback(data);
                });
            },
            GetConfiguration: function(args, callback) {
                handlers.GetConfiguration.handle(args).then(function(data) {
                    callback(data);
                });
            },
            GetLocalListVersion: function(args, callback) {
                handlers.GetLocalListVersion.handle(args).then(function(data) {
                    callback(data);
                });
            },
            ReserveNow: function(args, callback) {
                handlers.ReserveNow.handle(args).then(function(data) {
                    callback(data);
                });
            },
            SendLocalList: function(args, callback) {
                handlers.SendLocalList.handle(args).then(function(data) {
                    callback(data);
                });
            }
        }
    }
}


module.exports = ChargePointService;
