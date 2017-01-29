const Utils = require('../utils/utils.js');
const ConnectionWrapper = require('./ConnectionWrapper');
const SRPCClientConnection = require('./SRPCClientConnection');
const SRPCServerConnection = require('./SRPCServerConnection');
const TransportLayerServer = require('./TransportLayerServer');
const TransportLayerClient = require('./TransportLayerClient');
const HTTPServerWrapper = require('./HTTPServerWrapper');
const WebSocketServerWrapper = require('./WebSocketServerWrapper');
const SOAPWrapper = require('./SOAP');

var url = require("url");

module.exports = {

  TRANSPORT_LAYER: 'websocket',
  LAYERS: ['websocket', 'soap'],
  PRINT_XML: false,
  PRINT_HEADERS: false,
  NETWORK_IP: '',
  DEFAULT_REMOTE_ACTION_PORT: 9000,
  ConnectionWrapper: ConnectionWrapper,
  SRPCClientConnection: SRPCClientConnection,
  SRPCServerConnection: SRPCServerConnection,
  TransportLayerServer: TransportLayerServer,
  TransportLayerClient: TransportLayerClient,
  HTTPServerWrapper: HTTPServerWrapper,
  WebSocketServerWrapper: WebSocketServerWrapper,
  SOAPWrapper: SOAPWrapper,

  retrieveIPAddress: function() {
    // TODO SYNC
    Utils.getNetworkIPs()(function(err, res) {
      Transport.NETWORK_IP = res.pop();
    });
  },

  retrievePort: function(url) {
    if (url == null)
      return null;

    // if no : after http://, return null
    if(url.lastIndexOf(':') < 5)
      return null;

    // For instance: ['http', '//localhost', '8080/']
    return parseInt(url.split(':')[2]);
  },

};
