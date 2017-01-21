const WebSocketServer = require("websocket").server;
const OCPP = require('../config/ocpp.js');
const Utils = require('../utils/utils.js');

class WebSocketServerWrapper {

  constructor(transportLayer) {
    this.transportLayer = transportLayer;

    this.httpWrapper = null;

    this._createWebSocket(this.transportLayer.simulator.port);
  }

  /**
   *  Creates a WebSocket Server on the specified port.
   *
   *  @api private
   */
  _createWebSocket(port) {
    var _this = this;

    this.httpWrapper = new HTTPServerWrapper();

    this.httpWrapper.listen(port, function() {
      Utils.log("Server is listening on port " + port, "cs");
    });

    this._wsServer = new WebSocketServer({
      httpServer: this.httpWrapper.httpServer,
      autoAcceptConnections: false,

      // prevent from deconnection when switching ping on/off
      dropConnectionOnKeepaliveTimeout: false,

      // enable ping from server
      keepalive: OCPP.KEEP_ALIVE_INTERVAL != 0,
      keepaliveInterval: OCPP.KEEP_ALIVE_INTERVAL * 1000
    });

    this._wsServer.on("request", function(connection) {
      _this._onRequest(connection);
    });
  }


  /**
   *  Fires when the client tries to connect. If
   *  successful, creates a {Connection} object and creates :
   *   - a {SRPCServerConnection}, to handle RPC calls
   *   - a {SRPCClientConnection}, to emit RPC calls
   *
   *  @api private
   */
  _onRequest(connection) {
    var url = connection.resourceURL.path;
    var cpId;

    if(OCPP.ENDPOINTURL == '/'){
        cpId = url.slice(1);
    }
    else{
        cpId = url.replace(OCPP.ENDPOINTURL + '/', '');
    }

    // if the endpoint url isn't at the beginning of url
    // (wrong url)
    if(url.indexOf(OCPP.ENDPOINTURL) != 0) {
      // return 404
      Utils.log("Attempt to url: "+ url +". Rejected: not found.", "cs");
      connection.reject(404);
      return;
    }

    // if no identity specified
    if(url == OCPP.ENDPOINTURL || url + '/' == OCPP.ENDPOINTURL) {
      Utils.log("Attempt to url: "+ url +". Rejected: no identity specified.", "cs");
      connection.reject(200, "No identity specified. Base URL is "+
        OCPP.ENDPOINTURL + ". You must append the identifier: "+
        OCPP.ENDPOINTURL +"/identifier.");
      return;
    }

    // get requested protocols
    var is_proto = false;
    var req_proto = "";

    for(var proto in connection.requestedProtocols) {
      if(req_proto){
          req_proto += " ";
      }

      req_proto += connection.requestedProtocols[proto];

      if(OCPP.SUB_PROTOCOL.indexOf(connection.requestedProtocols[proto]) > -1) {
        is_proto = true;
        break;
      }
    }

    if(!is_proto) {
      var msg = "Unknown protocol `"+ req_proto +"'";
      Utils.log(msg, "cs");
      connection.reject(200, msg);
      return;
    }

    try {
      var conn = connection.accept(req_proto, connection.origin);
    } catch(e) {
      return;
    }

    var connectionWrapper = new Transport.ConnectionWrapper(conn);

    conn.cpId = cpId;

    Utils.log("ChargePoint #"+ cpId + " connected (protocol: "+ req_proto +").", "cs");

    this.transportLayer.simulator._connections[cpId] = {
      server: new Transport.SRPCServerConnection(connectionWrapper, "cs"),
      client: new Transport.SRPCClientConnection(connectionWrapper, "cs")
    };

    // call plugin handler
    //Plugins.callClientConnectionEventHandlers('connected', cpId, this);

    Utils.log(cpId + " connected to Central System", "cs");
  }


  /**
   *  Enable or disable CS-to-CP pings.
   *
   */
  setWebSocketPingInterval(interval) {
    // Enable ping and update frequency
    if(interval != 0) {
      Utils.log('WebSocket ping from CS to CP enabled by user.');
      this._wsServer.config.keepalive = true;
      this._wsServer.config.keepaliveInterval =
        OCPP.KEEP_ALIVE_INTERVAL = interval * 1000;

      var conns = this._wsServer.connections;
      for(var c in conns) {
        // little hack, handler is not defined in Connection constructeur if
        // keepalive = false
        conns[c]._keepaliveTimerHandler = conns[c].handleKeepaliveTimer.bind(conns[c]);

        // call a ping
        conns[c].setKeepaliveTimer();
      }
    } else {
      // Disable ping
      this.transportLayer.Simulators.centralSystem._wsServer.config.keepalive
        = false;

      // clear all remaining pings
      var conns = this.transportLayer.Simulators.centralSystem._wsServer.connections;
      for(var c in conns) {
        if(conns[c]._keepaliveTimeoutID) {
          clearTimeout(conns[c]._keepaliveTimeoutID);
        }
      }
    }
  }



}

module.exports = WebSocketServerWrapper


WebSocketServerWrapper.prototype = {



  /**
   *  Enable or disable CS-to-CP pings.
   *
   */
  setWebSocketPingInterval: function(interval) {
    // Enable ping and update frequency
    if(interval != 0) {
      Utils.log('WebSocket ping from CS to CP enabled by user.');
      this._wsServer.config.keepalive = true;
      this._wsServer.config.keepaliveInterval =
        OCPP.KEEP_ALIVE_INTERVAL = interval * 1000;

      var conns = this._wsServer.connections;
      for(var c in conns) {
        // little hack, handler is not defined in Connection constructeur if
        // keepalive = false
        conns[c]._keepaliveTimerHandler = conns[c].handleKeepaliveTimer.bind(conns[c]);

        // call a ping
        conns[c].setKeepaliveTimer();
      }
    } else {
      // Disable ping
      this.transportLayer.Simulators.centralSystem._wsServer.config.keepalive
        = false;

      // clear all remaining pings
      var conns = this.transportLayer.Simulators.centralSystem._wsServer.connections;
      for(var c in conns) {
        if(conns[c]._keepaliveTimeoutID) {
          clearTimeout(conns[c]._keepaliveTimeoutID);
        }
      }
    }
  }

};

module.exports = WebSocketServerWrapper;
