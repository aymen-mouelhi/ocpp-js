const WebSocketClient = require("websocket").client;

/**
 *  WebSocketClient
 *
 */
var WebSocketClientWrapper = function(transportLayer) {
  this.transportLayer = transportLayer;

  this.transportLayer.simulator.uri += '/' +
    this.transportLayer.simulator.chargePointId;

  this._wsClient = null;
  this.websocketPingId = null;
  this.httpWrapper = null;
  this.connected = false;

  this._createWebSocket();
};

WebSocketClientWrapper.prototype = {

  /**
   *  Create a client WebSocket.
   *
   *  @api private
   */
  _createWebSocket: function() {
    this._wsClient = new WebSocketClient();
    this._tryConnect();
  },

  /**
   *  Runs and loops until the {ChargePointSimulator} gets a connection.
   *
   *  @param {Array} Contains the scope if defined
   *  @api private
   */
  _tryConnect: function(args) {
    if(this.connected)
      return;

    // get the scope
    var _this = args != undefined ? args[0] : this;

    _this._wsClient.on("connect", function (connection) {
      if(!_this.connected)
        _this._onConnect(connection);
    });

    // if the connection fails, try to reconnect
    _this._wsClient.on("connectFailed", function(error) {
      // if error 404 : wrong path
      if(typeof error == 'string' && error.indexOf('404') > -1) {
        Utils.log("Connect Error: 404 Not Found. Wrong endpoint URL.");
      }
      else if(typeof error == 'string' && error.indexOf('200') > -1) {
        Utils.log("Connect Error: 200 No identity specified.");
      }
      else {
        Utils.log("Connect Error: "+ error.toString() +
          ". Retry in "+ OCPP.TRY_INTERVAL +" seconds ...",
          _this.chargePointId);
        setTimeout(function(args) {
          args[0]._wsClient.connect(args[0].transportLayer.simulator.uri,
            OCPP.SUB_PROTOCOL);
        }, OCPP.TRY_INTERVAL * 1000, [_this]);
      }
    });

    this._wsClient.connect(this.transportLayer.simulator.uri,
      this.transportLayer.simulator.protocol);
  },

  /**
   *  If the connection is established, the ChargePointSimulator uses
   *  this connection to create:
   *   - a {SRPCServerConnection}, to handle RPC calls
   *   - a {SRPCClientConnection}, to emit RPC calls
   *
   *  @api private
   */
  _onConnect: function(connection) {
    var _this = this;

    this._connected = true;

    Utils.log("Connected to Central System.", this.chargePointId)

    // call plugin handler
    // Plugins.callConnectionEventHandlers('connected', this.chargePointId, this);

    var connectionWrapper = new Transport.ConnectionWrapper(connection);
    connectionWrapper._protocol = this._protocol;

    // if the connection fails, retry
    connectionWrapper.on("close", function() {
      Plugins.callConnectionEventHandlers('disconnected',
        _this.transportLayer.simulator.chargePointId,
        _this);

      _this.connected = false;
      Utils.log("Connection lost, retry in "+ OCPP.TRY_INTERVAL +" seconds.",
        _this.transportLayer.simulator.chargePointId);
      _this._wsClient.connect(_this.transportLayer.simulator.uri,
        OCPP.SUB_PROTOCOL);
    });

    var serverConnection = new Transport.SRPCServerConnection(connectionWrapper,
        this.transportLayer.simulator.chargePointId);
    this.transportLayer.simulator.clientConnection =
      new Transport.SRPCClientConnection(connectionWrapper,
        this.transportLayer.simulator.chargePointId);

    // BootNotification at start - disabled until we figure out whether
    // we should have an 'automatic mode'
    if(false) {
      this.clientConnection.rpcCall("BootNotification", {
          chargePointVendor: "GIR",
          chargePointModel: "ocppjs-1.0.2"
        },
        TIMEOUT,
        OCPP.procedures.BootNotification.resultFunction,
        {
          to: "cs",
        });
    }

    this.setWebSocketPingInterval(OCPP.KEEP_ALIVE_INTERVAL);
  },

  /**
   *  Enable or disable CP-to-CS websocket ping
   *
   */
  setWebSocketPingInterval: function(interval) {
    if(interval != 0) {
      Utils.log('WebSocket ping from CP to CS enabled by user.');
      (function pingInterval(interval, _this) {
        _this.transportLayer.simulator.clientConnection._connection
          ._connection.ping();
        _this.webSocketPingId =
          setTimeout(pingInterval, interval * 1000, interval,
            _this);
      })(interval, this);
    }
    else {
      clearTimeout(this.webSocketPingId);
    }
  },

};
