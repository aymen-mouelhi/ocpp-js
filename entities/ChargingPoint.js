const OCPP = require('../config/ocpp.js');
const Transport = require('../transport');
const Utils = require('../utils/utils.js');

class ChargingPoint {
    constructor(uri, identifier, protocol = "ocpp1.5", transport = Transport.TRANSPORT_LAYER, soapOptions) {
        this.uri = uri;
        this.protocol = protocol;
        this.transport = transport;
        this.chargePointId = identifier;
        this.clientConnection = null;

        this.transportLayer = new Transport.TransportLayerClient(this, transport, 'cp', 'client', soapOptions);

        if (this.transport == 'soap') {
            this.transportLayer.layer.soapServ.log = logSoap;
            this.transportLayer.layer.soapServ.postProcess = function() {
                Plugins.callIdleHandlers(this);
            };
        }
    }

    /**
     *  Calls a client procedure
     *
     *  @param {String} Procedure URI
     *  @param {Array} Arguments
     */
    clientAction(procUri, args) {
        var resultFunction = function(){};
        if (this.clientConnection) {
            this.clientConnection.rpcCall(procUri, args, OCPP.TIMEOUT, resultFunction, {
                to: "cs"
            });
        } else {
            console.log('Error: not connected to any central system.');
        }
    }

    getId(){
      return this.chargePointId;
    }

    bootNotification(data){
      this.clientAction('BootNotification', data);
    }

    heartbeat(){
      this.clientAction('Heartbeat', {});
    }

    meterValues(data){
      data.connectorId = this.getId();
      this.clientAction('MeterValues', data);
    }

    sendStatusNotification(data){
      data.connectorId= this.getId();
      this.clientAction('StatusNotification', data);
    }

    startTransaction(data){
      data.connectorId= this.getId();
      this.clientAction('StartTransaction', data);
    }

    stopTransaction(data){
      data.connectorId= this.getId();
      this.clientAction('StopTransaction', data);
    }

}

module.exports = ChargingPoint;
