var CentralSystem = require('../entities/CentralSystem.js');

var server = new CentralSystem('9220');


//server.remoteAction('reset', 'EVLink-2');
//
var remote = setInterval(function() {
    var connection;

    // Execute some remote actions
    //server.clearCache(id);

    server.reset(1, 'localhost:9221/Ocpp/ChargePointService/', {
        type: 'Soft'
    });

    /*
    server.changeAvailability(id, {
        connectorId: id,
        type: 'Inoperative'
    });
    */

    clearInterval(remote);
}, 10000);
