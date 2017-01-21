var events = require("events");
var util = require("util");
const Utils = require('../utils/utils.js');

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


module.exports = ConnectionWrapper;
