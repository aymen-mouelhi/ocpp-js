const Config = require('../config/config.js');
const Utils = require('../utils/utils.js');
const Transport = require('../transport');
const SOAPWrapper = new Transport.SOAPWrapper();

class CentralSystem{
    constructor(port, transport = Transport.TRANSPORT_LAYER) {
        var self = this;
        this.port = port;
        this._wsServer = null;
        this._connections = [];
        this.transportLayer = new Transport.TransportLayerServer(this, transport, 'cs', 'server');
        SOAPWrapper.createChargePointClient().then(function(client){
            self.chargePointClient = client;
        });


        /*
        var _this = this;
        if (transport == 'soap') {
            this.transportLayer.layer.soapServ.setRemoteAddress = function(cbId, address, action) {
                // if not bootnotification, stop
                if (action != 'BootNotification')
                    return;
                //Plugins.callClientConnectionEventHandlers('connected', cbId, this);

                Utils.log('[setRemoteAddress] ChargePoint #' + cbId + ' connected.', 'cs');

                var connection = {
                  chargeBoxIdentity: cbId,
                  client: new Transport.TransportLayerClient(this,transport, 'cs', 'client', {
                          fromHeader: address
                      }).layer
                }

                _this._connections.push(connection);

                console.log('_this._connections: ' + _this._connections);
            };

            this.transportLayer.layer.soapServ.log = Utils.logSoap;
        }
        */

        // TODO: create SOAP client for server actions
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
        var connection = null;

        for(var i=0; i<this._connections.length; i++){
          var c = this._connections[i];
          if(c.chargeBoxIdentity === clientId){
              connection = c;
          }
        }

        if (!connection) {
            console.log("Error: charge point #" + clientId + " does not exist");
            return;
        }

        var resultFunction = function() {};

        connection.client.rpcCall(procName, args || {}, Config.TIMEOUT, resultFunction, { to: "cp#" + clientId });

        clientId = clientId || 'EVlink-2';
        // Remove soap headers
        this.chargePointClient.addSoapHeader({
          chargeBoxIdentity: clientId
        });

    }

    getConnections(){
      return this._connections;
    }

    restartChargingPoint(pointId){
      // TODO: method chaining => remoteAction should return a promise
      this.reset(pointId, {
        type: 'Hard'
      });

      this.unlockConnector(pointId);
    }

    _updateSoapHeaders(clientId){
      // Remove soap headers
      this.chargePointClient.clearSoapHeaders();

      this.chargePointClient.addSoapHeader({
        chargeBoxIdentity: clientId
      });
    }

    clearCache(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.ClearCache(function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeAvailability(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.ChangeAvailability(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeConguration(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.ChangeConguration(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getConguration(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetConguration(function(result){
        console.log(JSON.stringify(result));
      });
    }

    getDiagnostics(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetDiagnostics(function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStartTransaction(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.RemoteStartTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStopTransaction(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.RemoteStopTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reset(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.Reset(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    unlockConnector(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.UnlockConnector({
        connectorId: stationId
      }, function(result){
        console.log(JSON.stringify(result));
      });
    }

    updateFirmware(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.UpdateFirmware(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reserveNow(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.ReserveNow(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    cancelReservation(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.CancelReservation(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    sendLocalList(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.SendLocalList(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getLocalListVersion(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetLocalListVersion(function(result){
        console.log(JSON.stringify(result));
      });
    }

    dataTransfer(stationId, data){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.DataTransfer(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

}

module.exports = CentralSystem;
