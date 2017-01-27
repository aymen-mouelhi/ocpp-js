var SOAPWrapper = require('../transport/SOAP.js');

var server = new SOAPWrapper('server', true);

server.createCentralSystemServer();

server.remoteAction('reset', 'EVLink-2');
