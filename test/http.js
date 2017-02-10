const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

var CentralSystem = require('../entities/CentralSystem.js');
var CentralSystemServer = new CentralSystem('9220');

app.set('port', (process.env.PORT || 7000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

app.get('/api/stations/:id/restart', function(req, res){
  //  Restart Station
  var pointId = req.params.id;
  // TODO: ID should be serial number

  Storage.findById('station', pointId, function(err, station){
    if(err){
      console.log('[http] Error: ' + err);
      //res.send(err);
    }else{
      console.log('[http] station: ' + JSON.stringify(station));
      console.log('[http] station remoteAddress: ' + station.remoteAddress);

      station.remoteAddress = station.remoteAddress || "192.168.0.114:8081"

      console.log('[OCPP Server] Restarting ' + station.chargeBoxIdentity + ' on ' + station.remoteAddress + '...');

      // TODO: Create Client
      CentralSystemServer.createChargeBoxClient(station);
      // TODO: Method chaingin
      CentralSystemServer.restartChargingPoint(station.chargeBoxIdentity, station.remoteAddress);
    }
  });
});

var server = app.listen(app.get('port'), function(){
  console.log('Server is running on port ' + app.get('port'));
});
