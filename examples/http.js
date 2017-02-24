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

  Storage.findById('station', pointId, function(err, station){
    if(err){
      console.log('[http] Error: ' + err);
      res.send(err);
    }else{
      //var endpoint = station.endpoint || "192.168.0.114:8081";
      console.log(`[OCPP Server] Restarting ${station.chargeBoxIdentity} on ${station.endpoint} ...`);

      // create client
      CentralSystemServer.createChargeBoxClient(station, function(){
        console.log(`[ChargeBox] Client Created for ${station.chargeBoxIdentity}`);
        CentralSystemServer.restartChargingPoint(station.chargeBoxIdentity, station.endpoint);
      });
    }
  });
});

var server = app.listen(app.get('port'), function(){
  console.log('Server is running on port ' + app.get('port'));
});
