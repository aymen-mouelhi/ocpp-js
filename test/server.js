const CentralSystem = require('../entities/CentralSystem');

var server = new CentralSystem(9000, 'websocket');


var remote = setInterval(function(){
  var connection;

  if (server.getConnections()) {
      connection = server.getConnections()[0];
      if(connection){
        var id = connection.cpId;

        // Execute some remote actions
        server.clearCache(id);

        server.changeAvailability(id, {
          connectorId: id,
          type: 'Inoperative'
        });

        // TODO: method chaining
      }else{
          console.log('No stations connected yet !');
      }
  }else{
    console.log('No stations connected yet !');
  }
  clearInterval(remote);
}, 10000);
