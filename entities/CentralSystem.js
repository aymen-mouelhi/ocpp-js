const Config = require('../config/config.js');
const Utils = require('../utils/utils.js');
const SOAPWrapper = require('../utils/SOAPWrapper');

class CentralSystem{
    constructor(port) {
        const wrapper = new SOAPWrapper(port);
        var self = this;
        this.port = port;
        wrapper.createCentralSystemServer();

        wrapper.createChargePointClient().then(function(client){
            self.chargePointClient = client;
        });
    }

    getConnections(){
      return this._connections;
    }

    restartChargingPoint(pointId){
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

      this.chargePointClient.ClearCache({}, function(result){
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

      this.chargePointClient.GetConguration({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getDiagnostics(stationId){
      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetDiagnostics({}, function(result){
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
