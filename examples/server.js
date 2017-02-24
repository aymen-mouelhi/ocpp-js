const CentralSystem = require('../entities/CentralSystem');

var server = new CentralSystem(9220, 'soap');


var remote = setInterval(function() {
    var connection;

    if (server.getConnections()) {
        connection = server.getConnections()[0];
    } else {
        console.log('No stations connected yet !');
    }

    if (connection) {
        id = connection.chargeBoxIdentity;
    } else {
        id = '3lsonASjk1';
    }

    // Execute some remote actions
    server.clearCache(id);

    server.reset(id, {
        type: 'Soft'
    });

    /*
    server.changeAvailability(id, {
        connectorId: id,
        type: 'Inoperative'
    });
    */

    clearInterval(remote);
}, 20000);
