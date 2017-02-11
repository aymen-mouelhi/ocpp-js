const SOAPWrapper = require('../utils/SOAPWrapper');
const wrapper = new SOAPWrapper();
const Utils = require('../utils/utils.js');

class ChargingPoint {
    constructor(uri, identifier) {
        var self = this;
        this.uri = uri;
        this.chargePointId = identifier;
        wrapper.createCentralClient().then(function(client) {
            console.log('[ChargingPoint] Creating Client for Central System Service');
            self.client = client;
        });
    }

    getId() {
        return this.chargePointId;
    }

    _updateSoapHeaders() {
        if (this.client) {
            // Remove soap headers
            this.client.clearSoapHeaders();

            this.client.addSoapHeader({
                chargeBoxIdentity: this.getId()
            });
        } else {
            console.log('[ChargingPoint] Client for Central System Service is not ready !');
        }
    }

    bootNotification(data) {
        this._updateSoapHeaders();

        var request = {
          bootNotificationRequest: data
        }

        this.client.BootNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] BootNotification Result ' + JSON.stringify(result));
            }
        });

    }

    heartbeat() {
        this._updateSoapHeaders();

        var request = {
          heartbeatRequest: {}
        }

        this.client.Heartbeat(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] Heartbeat Result ' + JSON.stringify(result));
            }
        });
    }

    meterValues(data) {
        this._updateSoapHeaders();

        // TODO: to be fixed
        data.connectorId = 1;

        var request = {
          meterValuesRequest: data
        }

        this.client.MeterValues(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] MeterValues Result ' + JSON.stringify(result));
            }
        });
    }

    sendStatusNotification(data) {

        this._updateSoapHeaders();

        data.connectorId = 1;

        var request = {
          statusNotificationRequest: data
        }

        this.client.StatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StatusNotification Result ' + JSON.stringify(result));
            }
        });
    }

    startTransaction(data) {

        this._updateSoapHeaders();

        data.connectorId = 1;

        var request = {
          startTransactionRequest: data
        }

        this.client.StartTransaction(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StartTransaction Result ' + JSON.stringify(result));
            }
        });
    }

    stopTransaction(data) {
        this._updateSoapHeaders();

        data.connectorId = 1;

        var request = {
          stopTransactionRequest: data
        }

        this.client.StopTransaction(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StopTransaction Result ' + JSON.stringify(result));
            }
        });
    }

    authorize(data) {

        this._updateSoapHeaders();

        var request = {
          authorizeRequest: data
        }

        this.client.Authorize(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] Authorize Result ' + JSON.stringify(result));
            }
        });
    }

    diagnosticsStatusNotification(data) {

        this._updateSoapHeaders();

        var request = {
          diagnosticsStatusNotificationRequest: data
        }

        this.client.DiagnosticsStatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] DiagnosticsStatusNotification Result ' + JSON.stringify(result));
            }
        });
    }

    firmwareStatusNotification(data) {
        this._updateSoapHeaders();

        var request = {
          firmwareStatusNotificationRequest: data
        }

        this.client.FirmwareStatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] FirmwareStatusNotification Result ' + JSON.stringify(result));
            }
        });
    }
}

module.exports = ChargingPoint;
