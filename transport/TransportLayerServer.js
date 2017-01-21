const WebSocketServerWrapper = require('./WebSocketServerWrapper');
const SOAPWrapper = require('./SOAPWrapper');
var soap = null; // init'ed later

var TransportLayerServer = function(simulator, transport, model, mode) {
  this.transport = transport;
  this.simulator = simulator;
  this.layer = null;

  if(transport.toLowerCase() == 'websocket') {
    this.layer = new WebSocketServerWrapper(this);
  }
  else if(transport.toLowerCase() == 'soap') {
    // lazy init of soap module
    if(soap == null)
      soap = require('./lib/soap');

    this.layer = new SOAPWrapper(this, model, mode);
  }
}
