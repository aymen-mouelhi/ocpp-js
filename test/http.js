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
  
  Stoarge.findById('station', pointId, function(err, station){
    if(err){
      console.log('[http] Error: ' + err);
      //res.send(err);
    }else{
      console.log('[OCPP Server] Restarting ' + station.chargeBoxIdentity + ' ...');
      CentralSystemServer.restartChargingPoint(station.chargeBoxIdentity, station.remoteAddress);
    }
  });
});

var server = app.listen(app.get('port'), function(){
  console.log('Server is running on port ' + app.get('port'));
});
