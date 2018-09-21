const Utils = require('../utils/utils.js');
const SOAPWrapper = require('../utils/SOAPWrapper');
const ip = require('ip');
const UUID = require('uuid-js');

class CentralSystem{
    constructor(port) {
        this.soapWrapper = new SOAPWrapper(port, true);
        var self = this;
        this.port = port;
        this.ip = ip.address();
        this.clients = [];

        this.soapWrapper.createCentralSystemServer(port);

        console.log(`[CentralSystem] Server IP: ${self.ip}`);
    }

    createChargeBoxClient(station, callback){
      var self = this;
      console.log(`Creating SOAP Client for ${station.endpoint}`);
      this.soapWrapper.createChargePointClient(station.endpoint).then(function(client){
          self.clients.push({
            client: client,
            endpoint: station.endpoint,
            chargeBoxIdentity: station.chargeBoxIdentity
          });
          callback();
      });
    }

    getOnlineChargePoints(){
      return this.clients;
    }

    _getClientByEndpoint(endpoint){
      var soapClient = this.clients.filter(function(client){
        return client.endpoint === endpoint;
      });

      if(soapClient.length > 0){
        return soapClient[0];
      }else{
        return null;
      }
    }

    restartChargingPoint(pointId, endpoint){
      this.reset(pointId, endpoint, {
        type: 'Hard'
      });

      this.unlockConnector(pointId, endpoint);
    }


    clearCache(stationId, remoteAddress){
      this.action = '/ClearCache';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        clearCacheRequest: {}
      }

      this.chargePointClient.ClearCache(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeAvailability(stationId, remoteAddress, data){
      this.action = '/ChangeAvailability';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        changeAvailabilityRequest: data
      }

      this.chargePointClient.ChangeAvailability(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    changeConguration(stationId, remoteAddress, data){
      this.action = '/ChangeConguration';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        changeCongurationRequest: data
      }

      this.chargePointClient.ChangeConguration(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getConguration(stationId, remoteAddress){
      this.action = '/GetConguration';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        getCongurationRequest: {}
      }

      this.chargePointClient.GetConguration(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getDiagnostics(stationId, remoteAddress){
      this.action = '/GetDiagnostics';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        getDiagnosticsRequest: {}
      }

      this.chargePointClient.GetDiagnostics(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStartTransaction(stationId, remoteAddress, data){
      this.action = '/RemoteStartTransaction';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        remoteStartTransactionRequest: data
      }

      this.chargePointClient.RemoteStartTransaction(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    remoteStopTransaction(stationId, remoteAddress, data){
      this.action = '/RemoteStopTransaction';

      this._updateSoapHeaders(stationId);

      var request = {
        remoteStopTransactionRequest: data
      }

      this.chargePointClient.RemoteStopTransaction(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reset(stationId, remoteAddress, data){
      this.action = '/Reset';

      this._updateSoapHeaders(stationId, remoteAddress);

      var client = this._getClientByEndpoint(remoteAddress);

      if(client){
        var soapClient = client.client;

        var request = {
          resetRequest: data
        }

        soapClient.Reset(request, function(result){
          console.log(JSON.stringify(result));
        });
      }else{
        console.log(`[SOAP Request] Client for ${remoteAddress} is not found !`);
      }
    }

    unlockConnector(stationId, remoteAddress){
      this.action = '/UnlockConnector';

      this._updateSoapHeaders(stationId, remoteAddress);

      var client = this._getClientByEndpoint(remoteAddress);

      if(client){
        var soapClient = client.client;

        var request = {
          unlockConnectorRequest: {
            connectorId: '1'
          }
        }

        this.chargePointClient.UnlockConnector(request, function(result){
          console.log(JSON.stringify(result));
        });
      }else{
        console.log(`[SOAP Request] Client for ${remoteAddress} is not found !`);
      }
    }

    updateFirmware(stationId, remoteAddress, data){
      this.action = '/UpdateFirmware';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        updateFirmwareRequest: data
      }

      this.chargePointClient.UpdateFirmware(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    reserveNow(stationId, remoteAddress, data){
      this.action = '/ReserveNow';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        reserveNowRequest: data
      }

      this.chargePointClient.ReserveNow(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    cancelReservation(stationId, remoteAddress, data){
      this.action = '/CancelReservation';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        cancelReservationRequest: data
      }

      this.chargePointClient.CancelReservation(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    sendLocalList(stationId, remoteAddress, data){
      this.action = '/SendLocalList';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        sendLocalListRequest: data
      }

      this.chargePointClient.SendLocalList(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    getLocalListVersion(stationId, remoteAddress){
      this.action = '/GetLocalListVersion';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        getLocalListVersionRequest: {}
      }

      this.chargePointClient.GetLocalListVersion(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    dataTransfer(stationId, remoteAddress, data){
      this.action = '/DataTransfer';

      this._updateSoapHeaders(stationId, remoteAddress);

      var request = {
        dataTransferRequest: data
      }

      this.chargePointClient.DataTransfer(request, function(result){
        console.log(JSON.stringify(result));
      });
    }

    _updateSoapHeaders(clientId, remoteAddress){
      var client = this._getClientByEndpoint(remoteAddress);
      var soapClient;

      if(client){
        soapClient = client.client;

        // Remove soap headers
        soapClient.clearSoapHeaders();

        clientId = clientId || 'Simulator';

        console.log(`Remote Address: ${remoteAddress}`);
        console.log(`Action: ${this.action}`);

        var to = remoteAddress || 'http://192.168.0.114:8081';
        //var to = 'http://127.0.0.1:8081/ChargeBox/Ocpp';

        // Generate a V4 UUID
        var uuid4 = UUID.create();

        soapClient.addSoapHeader('<h:chargeBoxIdentity xmlns:h="urn://Ocpp/Cp/2012/06/" >'+ clientId + '</h:chargeBoxIdentity>')
        soapClient.addSoapHeader('<a:MessageID>urn:uuid:' + uuid4 + '</a:MessageID>')
        soapClient.addSoapHeader('<a:From><a:Address>http://localhost:9220/Ocpp/CentralSystemService</a:Address></a:From>')
        soapClient.addSoapHeader('<a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo>')
        soapClient.addSoapHeader('<a:To>'+ to + '</a:To>')
        soapClient.addSoapHeader('<a:Action soap:mustUnderstand="1">'+ this.action +'</a:Action>')
      }else{
        console.log(`[SOAP Headers] Client for ${remoteAddress} is not found !`);
        return;
      }
    }
}

module.exports = CentralSystem;
