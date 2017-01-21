"use strict"

var events = require("events"),
    util = require("util"),
    http = require("http"),
    url = require("url"),
    soap = null; // init'ed later

var OCPP = require('../config/ocpp.js'),
    Utils = require('./utils.js');

//var Plugins = require('./plugins.js');

var WebSocketServer = require("websocket").server,
    WebSocketClient = require("websocket").client;

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


var TransportLayerClient = function(simulator, transport, model, mode, soapOptions) {
  this.transport = transport;
  this.simulator = simulator;
  this.layer = null;

  if(transport.toLowerCase() == 'websocket') {
    this.layer = new WebSocketClientWrapper(this);
  }
  else if(transport.toLowerCase() == 'soap') {
    // lazy init of soap module
    if(soap == null)
      soap = require('./lib/soap');

    this.layer = new SOAPWrapper(this, model, mode, soapOptions);
  }
};

var WebSocketServerWrapper = function(transportLayer) {
  this.transportLayer = transportLayer;

  this.httpWrapper = null;

  this._createWebSocket(this.transportLayer.simulator.port);
}

WebSocketServerWrapper.prototype = {

  /**
   *  Creates a WebSocket Server on the specified port.
   *
   *  @api private
   */
  _createWebSocket: function(port) {
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
  },

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
  },

  /**
   *  Fires when the client tries to connect. If
   *  successful, creates a {Connection} object and creates :
   *   - a {SRPCServerConnection}, to handle RPC calls
   *   - a {SRPCClientConnection}, to emit RPC calls
   *
   *  @api private
   */
  _onRequest: function(connection) {
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

};


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


/**
 *  SOAPWrapper
 *
 *  @attr mode : server or client
 */

var SOAPWrapper = function(transportLayer, from, mode, soapOptions) {
  this.httpServer = null;
  this.client = null;
  this.transportLayer = transportLayer;
  this.cbId = transportLayer.simulator.chargePointId;
  this.fromHeader = soapOptions && soapOptions.fromHeader;
  this.from = from;
  this.to = from == 'cs' ? 'cp' : 'cs';
  this.soapServ = null;

  this.port = null;
  this.services = null;
  this.endpoint = null;
  this.soapService = {};

  // pointer to soap lib response
  this.res = null;
  this.wsdl = null;

  this.uri = null;
  if(this.from == 'cp')
    this.uri = this.transportLayer.simulator.uri;
  else
    this.uri = soapOptions && soapOptions.fromHeader;

  if(this.from == 'cs') {
    this.soapService.CentralSystemService = {
        CentralSystemServiceSoap12: {}
      };
    this.port = this.transportLayer.simulator.port;
    this.services = this.soapService.CentralSystemService.
      CentralSystemServiceSoap12;
    this.endpoint = OCPP.ENDPOINTURL;
  }
  else {
    this.soapService.ChargePointService = {
        ChargePointServiceSoap12: {}
      };

    // TODO better check for retrieving port and endpoint url
    this.port = soapOptions.remoteActionPort;
    this.services = this.soapService.ChargePointService.
      ChargePointServiceSoap12;
    this.endpoint = this.fromHeader &&
      this.fromHeader.split(':')[2].split('/')[1] || '/';
  }

  if(mode == 'server') {
    this.createService();
  }
  else {
    this.createClient();

    if(this.from == 'cp') {
      this.createService();
    }
  }
};

SOAPWrapper.prototype = {

  createService: function() {
    var version = Utils.retrieveVersion(OCPP.SUB_PROTOCOL),
        procedures = OCPP.procedures[version][this.from],
        _this = this;

    // stock procedures responses
    for(var p in procedures) {
      this.services[p] = (function(p) {
        return function(requestBody) {
          // callHeaders might return a response object,
          // otherwise, pick the default reponse
          return Plugins.callHandlers(p, requestBody, this)
            || OCPP.wsdl[version][p + 'Response'];
        };
      })(p);
    }

    var file = OCPP.WSDL_FILES[this.from +'_'+ version];
    var xml = require('fs').readFileSync(__dirname +'/../'+ file, 'utf8'),
        server = new HTTPServerWrapper().httpServer;

    server.listen(this.port);

    if(server.address() == undefined) {
      console.log('Error: cannot listen on port '+ this.port +'.');
      console.log('Program interrupted.')
      process.exit(1);
      return;
    }

    this.port = server.address().port;
    Utils.log('SOAP Server listening on port '+ this.port, 'cs');

    this.soapServ = soap.listen(server, this.endpoint, this.soapService, xml);

    soap.WSDL.WITH_ATTR_AT = OCPP.WITH_ATTR_AT;
    soap.WSDL.PROTOCOL_VERSION = version;

    var _this = this;
    this.soapServ.checkErrors = function(result, res) {
      _this.res = res;
      _this.wsdl = this.wsdl;

      var obj = this.wsdl.xmlToObject(result);
      if(!obj) {
        _this._returnError('', '', "FormationViolation");
        return;
      }

      var args = {},
          procName = obj.Header.Action.slice(1),
          name = procName.toLowerCase(),
          version = Utils.retrieveVersion(OCPP.SUB_PROTOCOL),
          model = _this.from,
          from = _this.to,
          m_params = {};

      // retrieve body
      for(var b in obj.Body) { args = obj.Body[b]; break; };

      if(OCPP.methodTree[version] != undefined
        && OCPP.methodTree[version][model] != undefined) {
        // if exists
        if(OCPP.methodTree[version][model][name] != undefined) {
          m_params = OCPP.methodTree[version][model][name]
            [procName + 'Request'];
        }
        else {
          //this._returnError(from, callId, "NotImplemented");
          return;
        }

        var params = Utils.clone(m_params);

        // infos for the CheckPayload function
        var infos = {
          //callId: callId,
          from: from,
          model: model,
          version: version
        };

        return OCPP.checkPayload(args, params, infos, _this);
      }

      // no method = error
      return false;
    };
  },

  createClient: function() {

    var _this = this,
        version = Utils.retrieveVersion(OCPP.SUB_PROTOCOL),
        file = __dirname +'/../'+ OCPP.WSDL_FILES[this.to +'_'+ version];

    this.transportLayer.simulator.clientConnection = this;

    var options = {
      endpoint: this.uri
    };

    soap.createClient(file, options, function(err, client) {
      _this.client = client;

      // Add headers

      if(_this.from != 'cs') {
        _this.client.addSoapHeader({
          chargeBoxIdentity: _this.transportLayer.simulator.chargePointId
        }, '', 'tns'); // TODO change tns by namespace defined in wsdl
      }

      _this.client.addSoapHeader({
        To: _this.transportLayer.simulator.uri
          || _this.transportLayer.layer.fromHeader,
      }, '', 'wsa5');

    });
  },

  /**
   *  HTTP Request
   */
  _httpRequest: function(content) {
    var _this = this,
        urlObj = url.parse(this.uri),
        content = content.slice(1, content.length-1);

    var options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.path,
      method: 'POST',
      headers: {
        'Content-Length': content.length,
        'Content-Type': 'application/soap+xml'
      }
    };

    var req = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        var msg = '<<'+ _this.to +':\n';
        if(Transport.PRINT_HEADERS) {
          msg += 'HTTP headers: '+ JSON.stringify(res.headers) + '\n';
        }
        msg += chunk;

        Utils.log(msg, _this.from == 'cp' ? _this.cbId : 'cs');
      });
    });

    req.write(content);
    req.end();

    var msg = '>>'+ _this.to +':\n';
    if(Transport.PRINT_HEADERS) {
      msg += 'HTTP headers: '+ JSON.stringify(options.headers) + '\n';
    }
    msg += content;
    Utils.log(msg, _this.from == 'cp' ? _this.cbId : 'cs');
  },

  /**
   *  SOAP RPC Call
   */
  rpcCall: function(procName, args, timeout, result, options) {
    // if send_raw
    if(procName == '' && typeof args == 'string') {
      this._httpRequest(args);
      return;
    }

    var _this = this,
        from = options.to == 'cs' ? _this.transportLayer.simulator.chargePointId
          : 'cs';

    if(this.fromHeader == null) {
      var host = this.uri.indexOf('localhost') > 0 ?
          'localhost' : Transport.NETWORK_IP;

      this.fromHeader = 'http://'+ host +':'+ this.port +'/';

      this.client.addSoapHeader({
        From: {
          Address: this.fromHeader
        }
      }, '', 'wsa5');
    }

    if(!Transport.PRINT_XML)
      Utils.log(">>"+ options.to + " /"+ procName  +" "+ JSON.stringify(args),
        from);

    // delete last Action header
    if(this.client.soapHeaders[this.client.soapHeaders.length - 1]
      .indexOf(':Action') > -1)
      this.client.soapHeaders.pop();

    // delete last chargeBoxIdentity header
    if(this.client.soapHeaders[this.client.soapHeaders.length - 1]
      .indexOf('chargeBoxIdentity') > -1)
      this.client.soapHeaders.pop();

    // if remote action
    if (this.from == 'cs') {
      // Add soap header
      this.client.addSoapHeader({
        chargeBoxIdentity: options.to.split('#')[1]
      }, '', 'tns');
    }

    // Add Action Header
    this.client.addSoapHeader({
      Action: '/'+ procName
    }, '', 'wsa5');

    // Call
    this.client[procName](args, function(err, result) {
      if(result == null) {
        Utils.log("<<"+ options.to +" Error: can't reach "+ _this.uri, from);
        return;
      }

      var msg = Transport.PRINT_XML
        ? _this.client.lastResponse
        : JSON.stringify(result);

      // if lib doesn't correctly parse response
      if(result.body != undefined) {
        Utils.log("<<"+ options.to
          +" Error: cannot parse response, raw content: "+
          JSON.stringify(result.body), from);
      }
      else {
        Utils.log("<<"+ options.to +" /"+ procName +" "+ msg, from);

        // call plugins result handlers
        Plugins.callResultHandlers(procName, result, this);

        // idle
        Plugins.callIdleHandlers(this);
      }
    });

    if(Transport.PRINT_XML)
      Utils.log(">>"+ options.to +" "+ this.client.lastRequest,
        from);
  },

  _returnError: function(from, callId, errorName, errorDesc) {
    var to = from == 'cs' ? 'cp' : 'cs',
        obj = {
          "SOAP-ENV:Body": {
            "SOAP-ENV:Fault": {
              "SOAP-ENV:Code": {
                "SOAP-ENV:Value": "SOAP-ENV:Sender",
                "SOAP-ENV:Subcode": {
                  "SOAP-ENV:Value": errorName
                },
              },
              "SOAP-ENV:Reason": {
                "SOAP-ENV:Text": errorDesc || ''
              }
            }
          }
        };

    var msg = this.soapServ._envelope(this.wsdl.objectToXML(obj));

    Utils.log('>>'+ from +' \n'+ msg, from);

    this.res.write(msg);
    this.res.end();
  }

};


/**
 *  HTTPServerWrapper
 *
 */

var HTTPServerWrapper = function() {
  this.httpServer = null;

  this.create();
};

HTTPServerWrapper.prototype = {

  create: function() {
    this.httpServer = http.createServer(function(request, response) {
      Utils.log("Received request for " + request.url, "cs");
      response.writeHead(404);
      response.end();
    });
  },

  listen: function(port, func) {
    this.httpServer.listen(port, func);
  }

};



/**
 *  ConnectionWrapper Interface. Inherits from wsio.Socket.
 *
 *  @param {WebSocketConnection} connection to handle
 *  @return {ConnectionWrapper}
 *  @api public
 */

var ConnectionWrapper = function(connection) {
  events.EventEmitter.call(this);

  this._connection = connection;

  // modify ping and pong functions for printing logs
  if(!OCPP.WITH_HEARTBEAT) {

    // Modification of WebSocketConnection.prototype.ping
    this._connection._ping = this._connection.ping;
    this._connection.ping = function(msg) {
      Utils.log("PING sent to: "+ this.remoteAddress);
      this._ping(msg);
    };

    // Modification of WebSocketConnection.prototype.pong
    this._connection._pong = this._connection.pong;
    this._connection.pong = function(msg) {
      Utils.log("PONG sent to: "+ this.remoteAddress);
      this._pong(msg);
    };

    // Modification of WebSocketConnection.prototype.processFrame
    this._connection._processFrame = this._connection.processFrame;
    this._connection.processFrame = function(frame) {
      switch(frame.opcode) {
      // ping
      case 0x09:
        Utils.log("PING received from: "+ this.remoteAddress);
        break;
      case 0x0A:
        Utils.log("PONG received from: "+ this.remoteAddress);
        break;
      }

      this._processFrame(frame);
    }
  }

  var _this = this;
  this._connection.on("message", function (message) {
    _this._onMessage(message);
  });
  this._connection.on("close", function () { _this._onClose(); });
  this._connection.on("error", function (err) { /*_this._onError(err);*/ });
};

util.inherits(ConnectionWrapper, events.EventEmitter);

ConnectionWrapper.prototype = {

  /**
   *  Inherits from EventEmitter.
   *
   */
  __proto__: events.EventEmitter.prototype,

  /**
   *  Send a message to the connection.
   *
   *  @param {int} Protocol ID (CALL, CALL_RESULT, etc.)
   *  @param {String} Procedure URI
   *  @param {Object} Arguments
   *
   *  @param {String} Message
   *  @api public
   */
  send: function(message) {
    // send UTF8
    this._connection.sendUTF(message);
  },

  /**
   *  Fires when a new message is received.
   *
   *  @api {Object} Message
   *  @api private
   */
  _onMessage: function(message) {
    // filter UTF8
    if(message.type !== "utf8") {
      Utils.log("Message format is not UTF8.");
      return;
    }

    var path = "cs";
    if(this._connection.cpId != undefined)
      path = this._connection.cpId;

    this.emit("message", [message.utf8Data, path]);
  },

  /**
   *  Fires when the connection is closed.
   *
   *  @api private
   */
  _onClose: function() {
    this.emit("close");
  }

};


/*
 * - A {SRPCServerConnection} implements a SRPC server (http://wamp.ws).
 *   Only the RPC part of the SRPC specification is implemented, and PREFIX
 *   messages are currently not supported.
 *   When created, a {SRPCServerConnection} sends a WELCOME message.
 *   When it receives a CALL message, a {SRPCServerConnection} decodes it:
 *   . If procURI resolves to a known method, the method is called, and its
 *     result is sent with a CALLRESULT or CALLERROR message.
 *   . If procURI doesn't resolve to a known method, a CALLERROR message is sent
 *     (TODO: define an error code).
 *
 *  @param {ConnectionWrapper} ConnectionWrapper object
 *  @api public
 */

function SRPCServerConnection(connection, cpId) {
  this._connection = connection;
  this._cpId = cpId;

  var _this = this;
  this._connection.on("message", function(msg) {
    _this._onCall(msg, this._connection.protocol);
  });
  this._connection.on("close", function() { _this._onClose(); });

  this._onCreate();
};

SRPCServerConnection.prototype = {

  /**
   *  Send a 'Welcome' message on the creation of a {SRPCServerConnection}
   *  object.
   *
   *  @api private
   */
  _onCreate: function() {
    // TODO
  },

  /**
   *  When it receives a CALL message, a {SRPCServerConnection} decodes it:
   *   . If procURI resolves to a known method, the method is called, and its
   *     result is sent with a CALLRESULT or CALLERROR message.
   *   . If procURI doesn't resolve to a known method, a CALLERROR message is
   *     sent (TODO: define an error code).
   *
   *  @param {String} Message
   *  @api private
   */
  _onCall: function(args, prot) {
    var from = args[1],
        message = null,
        model = from == "cs" ? "cp" : "cs";

    // add cp# for displaying
    if (from != "cs")
      from = "cp#"+ from;

    try {
      message = JSON.parse(args[0]);
    } catch (exception) {
      Utils.log("Error: message "+ args[0] +" can't be parsed.");
      // TODO how can i get the callID if it cant parse the message ?
      //this._returnError("FormationViolation");
      return;
    }

    // extract informations
    var typeId = message[0],
        callId = message[1],
        procName = message[2],
        values = message[3];

    // deny if it's not a call
    if(typeId != OCPP.protocolID.TYPE_ID_CALL)
      return;

    // callId is limited to 36 chars according to specifications
    if (callId.length > 36) {
      this._returnError(from, callId, "ProtocolError",
        "callId is too long (>36 chars)");
      return;
    }

    // Log
    Utils.log("<<"+ from +" "+ JSON.stringify(message), this._cpId);

    // call plugins handlers
    var onCallValues = Plugins.callHandlers(procName, values, this);

    var name = procName.toLowerCase(),
        version = Utils.retrieveVersion(prot),
        // infos for the CheckPayload function
        infos = {
          callId: callId,
          from: from,
          model: model,
          version: version,
          procName: procName,
          suffix: "Request"
        };

    // check payload error
    if(!OCPP.managePayloadErrors(values, infos, this))
      return;

    // check payload error: old version
    //if(this._managePayloadErrors(version, model, name, values, infos))
    //  return;

    // call return
    var res = [
      OCPP.protocolID.TYPE_ID_CALL_RESULT,
      callId,
      onCallValues || []
    ];

    if(!onCallValues) {
      if(OCPP.procedures[version][model][procName] != undefined) {
        var values = null;

        // fill the arguments of the call return
        if(OCPP.procedures[version][model][procName].handlerFunction
          != undefined) {
          // Internal Error if the procedre crashes
          try {
            values = OCPP.procedures[version][model][procName].handlerFunction
              .call(this, message);
          } catch (exception) {
            this._returnError(from, callId, "InternalError");
            return;
          }
        }
        else
          values = OCPP.wsdl[version][procName +'Response'];

        res[2] = values;

        // check if proc is supported
        if(res[2] == "NotSupported") {
          this._returnError(from, callId, "NotSupported");
          return;
        }
      }
      else {
        this._returnError(from, callId, "NotImplemented");
        return;
      }
    }

    // if lib doesn't correctly parse the response, display an error
    Utils.log(">>"+ from +" "+ JSON.stringify(res), this._cpId);

    // send response
    this._connection.send(JSON.stringify(res));

    //
    Plugins.callIdleHandlers(this);
  },

  /**
   *  Return a CALLERROR
   *
   */
  _returnError: function(from, callId, errorName, errorDesc) {
    var res = [
      OCPP.protocolID.TYPE_ID_CALL_ERROR,
      callId,
      errorName,
      errorDesc || OCPP.ERRORS_DESC[errorName] || '',
      {}
    ];

    Utils.log(">>"+ from +" "+ JSON.stringify(res), this._cpId);

    this._connection.send(JSON.stringify(res));
  },

  /**
   *  Fires when a charge point disconnects
   *
   */
  _onClose: function() {
    var cpId = this._connection._connection.cpId;
    Utils.log("Disconnected", cpId);
    //Plugins.callClientConnectionEventHandlers('disconnected', cpId, this);
  }
};


/*
 * - A {SRPCClientConnection} exposes a 'call' method, that implements a SRPC
 *   RPC call. The 'call' method has four parameters:
 *   . procUri: the remote procedure name
 *   . args: the remote procedure input arguments
 *   . timeout: the maximum time to wait for a response
 *   . result: a callback which is called when the RPC result is available
 *   The 'call' method sends a CALL message using procUri and args, and adds
 *   it to a private list of pending messages.
 *   . When a {SRPCClientConnection} receives a CALLRESULT or CALLERROR message
 *     with a callID field that matches one of its pending messages, it calls
 *     the <result> callback and removes the message from the list.
 *   . When the <timeout> of a pending message is reached, it is removed from
 *     the list  (TODO: define whether <result> should be called in that case).
 *
 *  @param {Connection} Connection object
 *  @api public
 */

function SRPCClientConnection(connection, cpId) {
  this._messages = {};
  this._cpId = cpId;

  this._connection = connection;

  var _this = this;
  this._connection.on("message", function(msg) { _this._onMessage(msg); });

};


SRPCClientConnection.prototype = {

  /**
   *  The 'call' method has four parameters:
   *   . procUri: the remote procedure name
   *   . args: the remote procedure input arguments
   *   . timeout: the maximum time to wait for a response
   *sult: a callback which is called when the RPC result is available
   *   The 'call' method sends a CALL message using procUri and args, and adds
   *   it to a private list of pending messages.
   *
   *  @param {String} Procedure URI
   *  @param {Array} Arguments
   *  @param {Int} Timeout in seconds
   *  @param {Function} A callback called when the RPC result is available.
   *  @param {Object} options
   *  @api public
   */
  rpcCall: function(procName, args, timeout, result, options) {
    var callId = Utils.makeId(),
        to = options.to || "";

    var content = null, do_stringify = true;
    if(typeof args == 'string') {
      if (procName == '')
        content = args;
      else
        content = '['+ OCPP.protocolID.TYPE_ID_CALL +',"'+ callId +'","'
          + procName +'",'+ args +']';

      do_stringify = false;
    }
    else {
      content = [OCPP.protocolID.TYPE_ID_CALL, callId, procName, args];
    }

    // create message to store
    var msg = {
      result_obj: result,
      timeoutId: undefined,
      content: content
    };
    this._messages[callId] = msg;

    var msgJSON = do_stringify ? JSON.stringify(msg.content) : msg.content;

    Utils.log('>>'+ to +' '+ msgJSON, this._cpId);

    // send message
    this._connection.send(msgJSON);

    // set a timeout for the response
    var id = setTimeout(this._onTimeout, timeout * 1000, [this, callId]);
    this._messages[callId].timeoutId = id;
  },

  /**
   *  Fires when a message is received.
   *
   *   . When a {SRPCClientConnection} receives a CALLRESULT or CALLERROR message
   *     with a callID field that matches one of its pending messages, it calls
   *     the <result> callback and removes the message from the list.
   *   . When the <timeout> of a pending message is reached, it is removed from
   *     the list  (TODO: define whether <result> should be called in that case)
   */
  _onMessage: function(args) {
    var from = args[1],
        msg = null,
        version = Utils.retrieveVersion(OCPP.SUB_PROTOCOL),
        model = from == "cs" ? "cs" : "cp",
        m_params = {};

    try {
      msg = JSON.parse(args[0]);
    }
    catch (e) {
      Utils.log("Error: message from cp#"+ from +" "+ args[0]
        +" can't be parsed", "cs");
      return;
    }

    var typeId = msg[0],
        callId = msg[1],
        args = msg[2],
        argsOriginal = Utils.clone(args),
        _this = this;

    // if it's not a call result
    if(typeId != OCPP.protocolID.TYPE_ID_CALL_RESULT) {
      this._onError(from, msg);
      return;
    }

    if (from != "cs")
      from = "cp#"+ from;

    Utils.log("<<"+ from  +" "+ JSON.stringify(msg), this._cpId);

    if(this._messages[callId] === undefined) {
      //Utils.log("Message #"+ callId + " : no related callbacks.");
      return;
    }

    // retrieve procedure name
    var procName = this._messages[callId].content[2],
        name = procName.toLowerCase();

    if(OCPP.methodTree[version] != undefined
      && OCPP.methodTree[version][model] != undefined) {
      // if exists
      if(OCPP.methodTree[version][model][name] != undefined) {
          m_params = OCPP.methodTree[version][model][name]
            [procName + 'Response'];
      }
      else {
        //this._returnError(from, callId, "NotImplemented");
        return;
      }

      var params = Utils.clone(m_params);

      // infos for the CheckPayload function
      var infos = {
        callId: callId,
        from: from,
        model: model,
        version: version,
        procName: procName,
        suffix: "Response"
      };

      // check if payload is correct
      //var error = OCPP.checkPayload(args, params, infos, this);

      OCPP.managePayloadErrors(args, infos, this);

      // if an error occurred
      //if(error)
      //  return;

    }

    var onSuccess = function(){};
    if(this._messages[callId].result_obj.handlers != undefined
      && this._messages[callId].result_obj.handlers.onSuccess != undefined)
      onSuccess = this._messages[callId].result_obj.handlers.onSuccess;

    // if not handler in Pluginsm call the default onSuccess method
    if(!Plugins.callResultHandlers(procName, argsOriginal, this))
      onSuccess.call(this, argsOriginal);

    Plugins.callIdleHandlers(this);

    // clear timeout and delete the stored message
    clearTimeout(this._messages[callId].timeoutId);
    this._deleteMessage(callId);
  },

  /**
   *  Timeout function for RPC calls
   *
   *  @param Array : scope and procId
   */
  _onTimeout: function(args) {
    var _this = args[0],
        callId = args[1];

    if(_this._messages[callId] === undefined) {
      // TODO
      return;
    }

    if(_this._messages[callId] != undefined
      && _this._messages[callId].result_obj.handlers != undefined)
      _this._messages[callId].result_obj.handlers.onError.call(_this, callId,
        "timeout");

    _this._deleteMessage(callId);
  },

  /**
   *  Fires when a Call Error is received
   *
   *  @param {Object} Message
   */
  _onError: function(from, msg) {
    var typeId = msg[0],
        callId = msg[1],
        errorName = msg[2],
        errorDesc = msg[3];

    if(typeId != OCPP.protocolID.TYPE_ID_CALL_ERROR)
      return;

    if (from != "cs")
      from = "cp#"+ from;

    Utils.log("<<"+ from  +" "+ JSON.stringify(msg), this._cpId);

    if(this._messages[callId] != undefined
      && this._messages[callId].handlers != undefined)
      this._messages[callId].result_obj.handlers.onError.call(this, callId,
        msg[2] +" - "+ msg[3]);

    this._deleteMessage(callId);
  },

  /**
   *  Delete
   *
   */
  _deleteMessage: function(callId) {
    if(this._messages[callId] === undefined)
      return;

    delete this._messages[callId];
  },

  /**
   *  Return a CALLERROR
   *
   */
  _returnError: function(from, callId, errorName, errorDesc) {
    console.log('WARNING : '+ errorName +' for CALLRETURN #'+ callId);
  }

};



var Transport = {

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

module.exports = Transport;
