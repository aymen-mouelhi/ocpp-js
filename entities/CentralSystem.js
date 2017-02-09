const Utils = require('../utils/utils.js');
const SOAPWrapper = require('../utils/SOAPWrapper');
const ip = require('ip');
const UUID = require('uuid-js');

class CentralSystem{
    constructor(port) {
        const wrapper = new SOAPWrapper(port, true);
        var self = this;
        this.port = port;
        this.ip = ip.address();
        this.clients = [];

        wrapper.createCentralSystemServer();

        // TODO: remove and make client creation on request
        /*
        wrapper.createChargePointClient().then(function(client){
            self.chargePointClient = client;
            self.chargePointClient.on('request', function(req){
              console.log('[Client Request] ' + req);
            })
        });
        */

        console.log(`[CentralSystem] Server IP: ${self.ip}`);
    }

    createChargeBoxClient(station){
      wrapper.createChargePointClient(endpoint).then(function(client){
          self.clients.push({
            client: client,
            endpoint: station.endpoint,
            chargeBoxIdentity: station.chargeBoxIdentity
          });
      });
    }

    getClientByEndpoint(endpoint){
      return this.clients.filter(function(client){
        return client.endpoint === endpoint;
      })
    }

    restartChargingPoint(pointId, remoteAddress){
      this.reset(pointId, remoteAddress, {
        type: 'Hard'
      });

      this.unlockConnector(pointId, remoteAddress);
    }

    // TODO: Add correct actionRequest in each of the following methods

    clearCache(stationId, remoteAddress){
      this.action = '/ClearCache';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.ClearCache({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeAvailability(stationId, remoteAddress, data){
      this.action = '/ChangeAvailability';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.ChangeAvailability(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeConguration(stationId, remoteAddress, data){
      this.action = '/ChangeConguration';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.ChangeConguration(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getConguration(stationId, remoteAddress){
      this.action = '/GetConguration';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.GetConguration({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getDiagnostics(stationId, remoteAddress){
      this.action = '/GetDiagnostics';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.GetDiagnostics({}, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStartTransaction(stationId, remoteAddress, data){
      this.action = '/RemoteStartTransaction';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.RemoteStartTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStopTransaction(stationId, remoteAddress, data){
      this.action = '/RemoteStopTransaction';

      this._updateSoapHeaders(stationId);

      this.chargePointClient.RemoteStopTransaction(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reset(stationId, remoteAddress, data){
      this.action = '/Reset';

      this._updateSoapHeaders(stationId, remoteAddress);

      var client = this.getClientByEndpoint(remoteAddress);

      var request = {
        resetRequest: data
      }

      client.Reset(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    unlockConnector(stationId, remoteAddress){
      this.action = '/UnlockConnector';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        unlockConnectorRequest: {
          connectorId: '1'
        }
      }

      this.chargePointClient.UnlockConnector(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    updateFirmware(stationId, remoteAddress, data){
      this.action = '/UpdateFirmware';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.UpdateFirmware(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reserveNow(stationId, remoteAddress, data){
      this.action = '/ReserveNow';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.ReserveNow(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    cancelReservation(stationId, remoteAddress, data){
      this.action = '/CancelReservation';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.CancelReservation(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    sendLocalList(stationId, remoteAddress, data){
      this.action = '/SendLocalList';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.SendLocalList(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getLocalListVersion(stationId, remoteAddress){
      this.action = '/GetLocalListVersion';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.GetLocalListVersion(function(result){
        console.log(JSON.stringify(result));
      });
    }

    dataTransfer(stationId, remoteAddress, data){
      this.action = '/DataTransfer';

      this._updateSoapHeaders(stationId, remoteAddress);

      this.chargePointClient.DataTransfer(data, function(result){
        console.log(JSON.stringify(result));
      });
    }

    _updateSoapHeaders(clientId, remoteAddress){
      // Remove soap headers
      this.chargePointClient.clearSoapHeaders();

      clientId = clientId || 'Simulator';

      console.log('Remote Address: ' + remoteAddress);

      var to = remoteAddress || 'http://192.168.0.114:8081';
      //var to = 'http://127.0.0.1:8081/ChargeBox/Ocpp';

      // Generate a V4 UUID
      var uuid4 = UUID.create();

      this.chargePointClient.addSoapHeader('<h:chargeBoxIdentity xmlns:h="urn://Ocpp/Cp/2012/06/" >'+ clientId + '</h:chargeBoxIdentity>')
      this.chargePointClient.addSoapHeader('<a:MessageID>urn:uuid:' + uuid4 + '</a:MessageID>')
      this.chargePointClient.addSoapHeader('<a:From><a:Address>http://localhost:9220/Ocpp/CentralSystemService</a:Address></a:From>')
      this.chargePointClient.addSoapHeader('<a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo>')
      this.chargePointClient.addSoapHeader('<a:To>'+ to + '</a:To>')
      this.chargePointClient.addSoapHeader('<a:Action soap:mustUnderstand="1">'+ this.action +'</a:Action>')

      console.log('Action: ' + this.action);
      console.log('Headers: ' + JSON.stringify(this.chargePointClient.getSoapHeaders()));
    }
}

module.exports = CentralSystem;
