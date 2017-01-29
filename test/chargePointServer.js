var SOAPWrapper = require('../transport/SOAP.js');

var server = new SOAPWrapper('server', true);

server.createChargePointServer();



//server.remoteAction('reset', 'EVLink-2');
