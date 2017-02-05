const Utils = require('../utils/utils.js');
const SOAPWrapper = require('../utils/SOAPWrapper');

class CentralSystem{
    constructor(port) {
        const wrapper = new SOAPWrapper(port, true);
        var self = this;
        this.port = port;
        wrapper.createCentralSystemServer();

        wrapper.createChargePointClient().then(function(client){
            self.chargePointClient = client;
        });

        Utils.getExternalIP(function (err, ip) {
          console.log(ip); // => 8.8.8.8
          self.ip = ip;
        });
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

      // TODO: Add From Header
      // <wsa5:MessageID>urn:uuid:5894ba7f-8906-4b29-bfdc-c2331befd79f</wsa5:MessageID>
      // <wsa5:From>
      //    <wsa5:Address>http://localhost:8081/</wsa5:Address>
      // </wsa5:From>
      // <wsa5:ReplyTo>
      //    <wsa5:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa5:Address>
      // </wsa5:ReplyTo>
      // <wsa5:To SOAP-ENV:mustUnderstand="true">http://192.168.0.118:9220/Ocpp/CentralSystemService</wsa5:To>
      // <wsa5:Action SOAP-ENV:mustUnderstand="true">/StartTransaction</wsa5:Action>

      // ChargeBoxIdentity
      this.chargePointClient.addSoapHeader({
        chargeBoxIdentity: clientId
      });

      // From Address
      this.chargePointClient.addSoapHeader({
        From: {
          Address: this.ip
        }
      });

      // ReplyTo
      this.chargePointClient.addSoapHeader({
        ReplyTo: {
          Address: 'http://www.w3.org/2005/08/addressing/anonymous'
        }
      });

      // Action
      this.chargePointClient.addSoapHeader({
        Action: this.action
      });
    }

    clearCache(stationId){
      this.action = '/ClearCache';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.ClearCache({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeAvailability(stationId, data){
      this.action = '/ChangeAvailability';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.ChangeAvailability(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeConguration(stationId, data){
      this.action = '/ChangeConguration';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.ChangeConguration(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getConguration(stationId){
      this.action = '/GetConguration';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetConguration({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getDiagnostics(stationId){
      this.action = '/GetDiagnostics';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetDiagnostics({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStartTransaction(stationId, data){
      this.action = '/RemoteStartTransaction';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.RemoteStartTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStopTransaction(stationId, data){
      this.action = '/RemoteStopTransaction';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.RemoteStopTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reset(stationId, data){
      this.action = '/Reset';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.Reset(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    unlockConnector(stationId){
      this.action = '/UnlockConnector';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.UnlockConnector({
        connectorId: '1'
      }, function(result){
        console.log(JSON.stringify(result));
      });
    }

    updateFirmware(stationId, data){
      this.action = '/UpdateFirmware';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.UpdateFirmware(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reserveNow(stationId, data){
      this.action = '/ReserveNow';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.ReserveNow(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    cancelReservation(stationId, data){
      this.action = '/CancelReservation';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.CancelReservation(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    sendLocalList(stationId, data){
      this.action = '/SendLocalList';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.SendLocalList(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getLocalListVersion(stationId){
      this.action = '/GetLocalListVersion';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.GetLocalListVersion(function(result){
        console.log(JSON.stringify(result));
      });
    }

    dataTransfer(stationId, data){
      this.action = '/DataTransfer';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.DataTransfer(data, function(result){
        console.log(JSON.stringify(result));
      });
    }
}

module.exports = CentralSystem;
