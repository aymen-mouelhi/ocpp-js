const Utils = require('../utils/utils.js');
const OCPP = require('../config/ocpp.js');
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
