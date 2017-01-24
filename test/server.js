const CentralSystem = require('../entities/CentralSystem');


const ORM = require('../orm/index.js');
var Storage = new ORM(process.env.storage);

Storage.findAll('users').then(function(users){
  console.log("users " + JSON.stringify(users));
})


var system = new CentralSystem(9000, 'websocket');

/*
setInterval(function(){
  var connection;
  if (system.getConnections()) {
      connection = system.getConnections()[0]
  }
  console.log(connection);
}, 3000);
*/
