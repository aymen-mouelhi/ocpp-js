const CentralSystem = require('../entities/CentralSystem');

var server = new CentralSystem(9000, 'websocket');

var remote = setInterval(function(){
  var connection;

  if (server.getConnections()) {
      connection = server.getConnections()[0];

      var id = connection.cpId;

      // Execute some remote actions
      server.clearCache(id);

      server.changeAvailability(id, {
        connectorId: id,
        type: 'Inoperative'
      })

  }else{
    console.log('No stations connected yet !');
  }
  clearInterval(remote);
}, 10000);
