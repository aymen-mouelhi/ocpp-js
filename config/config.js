
var CONFIG = {
  SUB_PROTOCOL: ["ocpp1.2", "ocpp1.5"],
  VERSIONS: ["1.2", "1.5"],
  SYSTEMS: ["cs", "cp"],
  TRY_INTERVAL: 10, // seconds
  TIMEOUT: 30, // seconds

  KEEP_ALIVE_INTERVAL: 0, // seconds, 0 by default, must be specified by user
  HEARTBEAT_INTERVAL: 300, // seconds

  ENDPOINTURL: "/",

  WITH_ATTR_AT: false,

  // Heartbeat = true
  // Websocket ping = false
  WITH_HEARTBEAT: false,
  WSDL_FILES: {
    "cs_1.2": "/wsdl/ocpp_centralsystemservice_1.2_final.wsdl",
    "cp_1.2": "/wsdl/ocpp_chargepointservice_1.2_final.wsdl",
    "cs_1.5": "/wsdl/ocpp_centralsystemservice_1.5_final.wsdl",
    "cp_1.5": "/wsdl/ocpp_chargepointservice_1.5_final.wsdl"
  },

  /**
   *  Message Types from OCPP SRPC over WebSocket specifications
   */

  protocolID: {
    "TYPE_ID_CALL": 2,
    "TYPE_ID_CALL_RESULT": 3,
    "TYPE_ID_CALL_ERROR": 4
  },

  procedures: [
    "Authorize",
    "BootNotification",
    "ChangeAvailability",
    "ChangeConguration",
    "ClearCache",
    "DiagnosticsStatusNotification",
    "FirmwareStatusNotification",
    "GetConguration",
    "GetDiagnostics",
    "MeterValues",
    "RemoteStartTransaction",
    "RemoteStopTransaction",
    "Reset",
    "StartTransaction",
    "StatusNotification",
    "StopTransaction",
    "UnlockConnector",
    "UpdateFirmware"
  ]
}

module.exports = CONFIG;
