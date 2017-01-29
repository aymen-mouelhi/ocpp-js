const Config = require('../config/config.js');
const Transport = require('../transport');
const SOAPWrapper = new Transport.SOAPWrapper();
const Utils = require('../utils/utils.js');

class ChargingPoint {
    constructor(uri, identifier, protocol = "Config1.5", transport = Transport.TRANSPORT_LAYER, soapOptions) {
        this.uri = uri;
        this.protocol = protocol;
        this.transport = transport;
        this.chargePointId = identifier;
        this.clientConnection = null;
        var self = this;
        /*
        this.transportLayer = new Transport.TransportLayerClient(this, transport, 'cp', 'client', soapOptions);

        if (this.transport == 'soap') {
            this.transportLayer.layer.soapServ.log = Utils.logSoap;
        }
        */

        SOAPWrapper.createCentralClient().then(function(client){
            self.client = client;
        });

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
            this.clientConnection.rpcCall(procUri, args, Config.TIMEOUT, resultFunction, {
                to: "cs"
            });
        } else {
            console.log('Error: not connected to any central system.');
        }
    }

    getId(){
      return this.chargePointId;
    }


    _updateSoapHeaders(){
      // Remove soap headers
      this.client.clearSoapHeaders();

      this.client.addSoapHeader({
        chargeBoxIdentity: this.getId()
      });
    }

    bootNotification(data){

      this._updateSoapHeaders();

      this.client.BootNotification(data, function(result){
        console.log(JSON.stringify(result));
      });

    }

    heartbeat(){
      this._updateSoapHeaders();

      this.client.Heartbeat(function(result){
        console.log(JSON.stringify(result));
      });
    }

    meterValues(data){
      this._updateSoapHeaders();

      data.connectorId = this.getId();

      this.client.MeterValues(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    sendStatusNotification(data){

      this._updateSoapHeaders();

      data.connectorId= this.getId();

      this.client.StatusNotification(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    startTransaction(data){

      this._updateSoapHeaders();

      data.connectorId= this.getId();

      this.client.StartTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    stopTransaction(data){
      this._updateSoapHeaders();

      data.connectorId= this.getId();

      this.client.StopTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    authorize(data){

      this._updateSoapHeaders();

      this.client.Authorize(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    diagnosticsStatusNotification(data){

      this._updateSoapHeaders();

      this.client.DiagnosticsStatusNotification(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    firmwareStatusNotification(data){

      this._updateSoapHeaders();

      this.client.FirmwareStatusNotification(data, function(result){
        console.log(JSON.stringify(result));
      });
    }
}

module.exports = ChargingPoint;
