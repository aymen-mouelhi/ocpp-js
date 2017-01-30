const CentralSystem = require('./entities/CentralSystem');

var system = new CentralSystem(9220);

setInterval(function(){
  var connection;
  if (system.getConnections()) {
      connection = system.getConnections()[0]
  }
  console.log(connection);
}, 3000);
