const Config = require('../config/config.js');
const SOAPWrapperModule = require('../transport/SOAP');
const SOAPWrapper = new SOAPWrapperModule();
const Utils = require('../utils/utils.js');

class ChargingPoint {
    constructor(uri, identifier, protocol = "Config1.5", transport = Transport.TRANSPORT_LAYER, soapOptions) {
        var self = this;
        this.uri = uri;
        this.protocol = protocol;
        this.transport = transport;
        this.chargePointId = identifier;
        this.clientConnection = null;
        SOAPWrapper.createCentralClient().then(function(client) {
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

        this.client.BootNotification(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });

    }

    heartbeat() {
        this._updateSoapHeaders();

        this.client.Heartbeat(function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    meterValues(data) {
        this._updateSoapHeaders();

        data.connectorId = this.getId();

        this.client.MeterValues(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    sendStatusNotification(data) {

        this._updateSoapHeaders();

        data.connectorId = this.getId();

        this.client.StatusNotification(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] Central System Result ' + JSON.stringify(result));
            }
        });
    }

    startTransaction(data) {

        this._updateSoapHeaders();

        data.connectorId = this.getId();

        this.client.StartTransaction(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    stopTransaction(data) {
        this._updateSoapHeaders();

        data.connectorId = this.getId();

        this.client.StopTransaction(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    authorize(data) {

        this._updateSoapHeaders();

        this.client.Authorize(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    diagnosticsStatusNotification(data) {

        this._updateSoapHeaders();

        this.client.DiagnosticsStatusNotification(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }

    firmwareStatusNotification(data) {
        this._updateSoapHeaders();

        this.client.FirmwareStatusNotification(data, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log(JSON.stringify(result));
            }
        });
    }
}

module.exports = ChargingPoint;
