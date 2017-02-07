var SOAPWrapper = require('../transport/SOAP.js');

var server = new SOAPWrapper('server', true);

//server.createCentralSystemServer();

server.createChargePointServer();



//server.remoteAction('reset', 'EVLink-2');
