var MongoDBStorage = require('./mongodb/MongoDBStorage');
var Utils = require('../utils/Utils');

class Storage {
  constructor(dbConfig) {
    // Read conf
    var storageConfigs = Utils.getStoragesConfig();
    this.storages = [];
    var that = this;

    // Instanciate
    storageConfigs.forEach(function(storageConfig) {
      // Check implementation
      switch (storageConfig.implementation) {
        // SOAP
        case 'mongodb':
          var mongoDB = new MongoDBStorage(storageConfig);
          if (storageConfig.main) {
            that.mainStorage = mongoDB;
          } else {
            that.storages.push(mongoDB);
          }
          break;

        default:
          console.log(`Storage Server implementation ${storageConfig.implementation} not found!`);
      }
    });
  }

  saveChargingStation(chargingStation) {
    // Delegate
    this.storages.forEach(function(storage) {
      // Trigger Save for other DB
      storage.saveChargingStation(chargingStation);
    });

    // Save in main DB
    return this.mainStorage.saveChargingStation(chargingStation).then(function() {
        // Nothing to do
    });
  }

  getChargingStation(chargePointSerialNumber) {
    // Get the first one
    return this.mainStorage.getChargingStation(chargePointSerialNumber);
  }
}

module.exports=Storage;
