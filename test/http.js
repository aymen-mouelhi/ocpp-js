const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

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
  console.log('[OCPP Server] Restarting ' + pointId + ' ...');
  CentralSystemServer.restartChargingPoint(pointId);
});

var server = app.listen(app.get('port'), function(){
  console.log('Server is running on port ' + app.get('port'));
});
