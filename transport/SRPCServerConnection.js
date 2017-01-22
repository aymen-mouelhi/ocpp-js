const Utils = require('../utils/utils.js');
const OCPP = require('../config/ocpp.js');

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

  // handle message
  this._connection.on("message", function(msg) {
    _this._onCall(msg, this._connection.protocol);
  });
  // handle close
  this._connection.on("close", function() {
    _this._onClose();
  });

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
      this._returnError(from, callId, "ProtocolError", "callId is too long (>36 chars)");
      return;
    }

    // Log
    Utils.log("<<"+ from +" "+ JSON.stringify(message), this._cpId);

    // call plugins handlers
    // var onCallValues = Plugins.callHandlers(procName, values, this);

    var name = procName.toLowerCase();
    var version = Utils.retrieveVersion(prot);

    // infos for the CheckPayload function
    var infos = {
        callId: callId,
        from: from,
        model: model,
        version: version,
        procName: procName,
        suffix: "Request"
      };

    // check payload error
    // TODO: uncomment and move to Utils
    /*
    if(!Utils.managePayloadErrors(values, infos, this))
      return;
    */

    // call return
    var res = [
      OCPP.protocolID.TYPE_ID_CALL_RESULT,
      callId,
      []
    ];


    // TODO: Use handlers to get real values for called procedre
    // TODO: remove dummy data
    var values = {
        chargePointVendor: 'DBT',
        chargePointModel: 'NQC-ACDC',
        chargePointSerialNumber: 'gir.vat.mx.000e48',
        chargeBoxSerialNumber: 'gir.vat.mx.000e48',
        firmwareVersion: '1.0.49',
        iccid: '',
        imsi: '',
        meterType: 'DBT NQC-ACDC',
        meterSerialNumber: 'gir.vat.mx.000e48'
      }

      res[2] = values;

      /*
    if(!onCallValues) {
      if(OCPP.procedures[version][model][procName] != undefined) {
        var values = null;

        // fill the arguments of the call return
        if(OCPP.procedures[version][model][procName].handlerFunction != undefined) {
          // Internal Error if the procedre crashes
          try {
            values = OCPP.procedures[version][model][procName].handlerFunction.call(this, message);
          } catch (exception) {
            this._returnError(from, callId, "InternalError");
            return;
          }
        }else{
            values = OCPP.wsdl[version][procName +'Response'];
        }

        res[2] = values;

        // check if proc is supported
        if(res[2] == "NotSupported") {
          this._returnError(from, callId, "NotSupported");
          return;
        }
      } else {
        this._returnError(from, callId, "NotImplemented");
        return;
      }
    }
    */

    // if lib doesn't correctly parse the response, display an error
    Utils.log(">>"+ from + " "+ JSON.stringify(res), this._cpId);

    // send response
    this._connection.send(JSON.stringify(res));

    // Plugins.callIdleHandlers(this);
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
  }
};

module.exports = SRPCServerConnection;
