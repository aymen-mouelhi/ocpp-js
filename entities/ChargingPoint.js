const OCPP = require('../config/ocpp.js');
const Transport = require('../utils/transport.js');

class ChargingPoint {
    constructor(uri, identifier, protocol = "ocpp1.5", transport = Transport.TRANSPORT_LAYER, soapOptions) {
        this.uri = uri;
        this.protocol = protocol;
        this.transport = transport;

        this.chargePointId = identifier;
        this.clientConnection = null;

        //Plugins.setAPIFields(transport, 'cp', OCPP.SUB_PROTOCOL, this.chargePointId);

        this.transportLayer = new Transport.TransportLayerClient(this,transport, 'cp', 'client', soapOptions);

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
        var resultFunction = function() {},
            version = Utils.retrieveVersion(this.transportLayer.simulator.protocol);

        if (OCPP.procedures[version]['cs'][procUri] != undefined &&
            OCPP.procedures[version]['cs'][procUri].resultFunction != undefined)
            resultFunction = OCPP.procedures[version]['cs'][procUri].resultFunction;

        if (this.clientConnection)
            this.clientConnection.rpcCall(procUri, args, OCPP.TIMEOUT,
                resultFunction, {
                    to: "cs"
                });
        else
            console.log('Error: not connected to any central system.');
    }


}

module.exports = ChargingPoint;
