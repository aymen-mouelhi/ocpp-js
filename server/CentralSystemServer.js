var ChargingStation = require('../storage/model/ChargingStation');
var SoapCentralSystemServer = require('./soap/SoapCentralSystemServer');
var Utils = require('../utils/Utils');
var Storage = require('../storage/Storage');

class CentralSystemServer {
  constructor() {
    // Read conf
    var serverConfig = Utils.getCentralSystemConfig();

    // Make it global
    global.centralSystem = this;

    // Check implementation
    switch (serverConfig.implementation) {
      // SOAP
      case 'soap':
        // Create implementation
        this.centralSystem = new SoapCentralSystemServer(serverConfig)
        break;
      default:
        console.log('Central System Server implementation not found!');
    }
  }

  // Start the server
  start() {
    // Create the storage
    global.storage = new Storage();

    // Start the Server
    this.centralSystem.start();
  }

  handleBootNotification(args, headers, req) {
    // Create the charging station
    var chargingStation = new ChargingStation(args);

    // Save
    return chargingStation.save().then(function() {
      return {
        bootNotificationResponse: {
          status: 'Accepted',
          currentTime: new Date().toISOString(),
          heartbeatInterval: 66
        }
      };
    });
  }
}

module.exports = CentralSystemServer;
