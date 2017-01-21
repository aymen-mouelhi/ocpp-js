var events = require("events"),
    util = require("util"),
    http = require("http"),
    url = require("url"),
    soap = null; // init'ed later

const OCPP = require('../config/ocpp.js');
const Utils = require('./utils.js');

module.exports = {

  //
  TRANSPORT_LAYER: 'websocket',
  LAYERS: ['websocket', 'soap'],

  //
  PRINT_XML: false,
  PRINT_HEADERS: false,

  //
  NETWORK_IP: '',

  //
  DEFAULT_REMOTE_ACTION_PORT: 9000,

  //
  ConnectionWrapper: ConnectionWrapper,
  SRPCClientConnection: SRPCClientConnection,
  SRPCServerConnection: SRPCServerConnection,

  //
  TransportLayerServer: TransportLayerServer,
  TransportLayerClient: TransportLayerClient,
  HTTPServerWrapper: HTTPServerWrapper,
  WebSocketServerWrapper: WebSocketServerWrapper,

  //
  initReferences: function(Simulators) {
    Plugins.Simulators = Simulators;
  },

  /**
   *  TODO
   */
  retrieveIPAddress: function() {
    // TODO SYNC
    Utils.getNetworkIPs()(function(err, res) {
      Transport.NETWORK_IP = res.pop();
    });
  },

  /**
   *
   */
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
