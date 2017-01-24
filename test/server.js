const CentralSystem = require('../entities/CentralSystem');

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


function getUsers(callback){
  // Callback
   MySQL.getUsers(function(users){
     callback(users)
  });

  // Promise
  return MySQL.getUsers().then(function(){
    return users;
  }).catch(function(error){
    return error;
  });
}
