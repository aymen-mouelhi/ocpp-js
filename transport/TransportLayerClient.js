const WebSocketClientWrapper = require('./WebSocketClientWrapper');
const SOAPWrapper = require('./SOAPWrapper');
var soap = null; // init'ed later

class TransportLayerClient {
  constructor(simulator, transport, model, mode, soapOptions) {
    this.transport = transport;
    this.simulator = simulator;
    this.layer = null;

    if(transport.toLowerCase() == 'websocket') {
      this.layer = new WebSocketClientWrapper(this);
    }
    else if(transport.toLowerCase() == 'soap') {
      // lazy init of soap module
      if(soap == null)
        soap = require('../lib/soap');

      this.layer = new SOAPWrapper(this, model, mode, soapOptions);
    }
  }
}

module.exports = TransportLayerClient;
