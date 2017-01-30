const handlers = require('../handlers');

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


module.exports = ChargePointService;
