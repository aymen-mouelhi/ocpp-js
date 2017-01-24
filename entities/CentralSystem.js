const OCPP = require('../config/ocpp.js');
const Transport = require('../transport');

class CentralSystem{
    constructor(port, transport = Transport.TRANSPORT_LAYER) {
        this.port = port;
        this._wsServer = null;
        this._connections = [];
        this.transportLayer = new Transport.TransportLayerServer(this, transport, 'cs', 'server');

        var _this = this;
        if (transport == 'soap') {
            this.transportLayer.layer.soapServ.setRemoteAddress = function(cbId, address, action) {
                // if not bootnotification, stop
                if (action != 'BootNotification')
                    return;
                //Plugins.callClientConnectionEventHandlers('connected', cbId, this);

                Utils.log('ChargePoint #' + cbId + ' connected.', 'cs');

                _this._connections[cbId] = {
                    client: new Transport.TransportLayerClient(this,transport, 'cs', 'client', {
                            fromHeader: address
                        }).layer
                };
            };

            this.transportLayer.layer.soapServ.log = logSoap;
            this.transportLayer.layer.soapServ.postProcess = function() {
                Plugins.callIdleHandlers(this);
            };
        }
    }

    stop() {
        this._wsServer.closeAllConnections();
        this._wsServer.shutDown();
        this._wsServer = null;
        this._httpServer.close();
        this._httpServer = null;
    }

    /*
     *  Calls a remote procedure
     *  @param {Number} the client ID
     *  @param {String} the procedure URI
     *  @api public
     */
    remoteAction(clientId, procName, args) {
        if (this._connections[clientId] == undefined) {
            Utils.log("Error: charge point #" + clientId + " does not exist");
            return;
        }

        var resultFunction = function() {};

        this._connections[clientId].client.rpcCall(procName, args || {},
            OCPP.TIMEOUT, resultFunction, {
                to: "cp#" + clientId
            });
    }

    getConnections(){
      return this._connections;
    }

    // TODO: restart charging point not supported in OCPP 1.5
    restartChargingPoint(pointId){

    }


}

module.exports = CentralSystem;
