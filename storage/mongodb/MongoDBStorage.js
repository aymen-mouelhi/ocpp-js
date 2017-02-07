var mongoose = require('mongoose');
var Promise = require('promise');
var MongoDBChargingStation = require('./model/MongoDBChargingStation');
var ChargingStation = require('../model/ChargingStation');
var Utils = require('../../utils/utils');

class MongoDBStorage {
    constructor(dbConfig) {
        // Keep local
        // TODO: Check params
        this.dbConfig = dbConfig;

        // Ovverride deprecated promise
        mongoose.Promise = Promise;

        // Connect
        mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.schema}`, function(err, db) {
            if (err) {
                console.log(`MongoDB: Error when connecting: ${err.message}`);
                return;
            }
            console.log(`MongoDB: Connected to ${dbConfig.host}:${dbConfig.port}, Schema ${dbConfig.schema}`);
        });
    }

    saveChargingStation(chargingStation) {
        // Get
        return this._getChargingStationMongoDB(chargingStation.getChargePointSerialNumber()).then(function(chargingStationMongoDB) {
            // Found?
            if (chargingStationMongoDB == null) {
                // No: Create it
                var newChargingStationMongoDB = new MongoDBChargingStation(chargingStation.getModel());

                // Create new
                newChargingStationMongoDB.save(function(err, results) {
                    if (err) {
                        console.log(`MongoDB: Error when creating Charging station ${chargingStation.getChargePointSerialNumber()}: ${err.message}`);
                        throw err;
                    }
                    console.log(`MongoDB: Charging station ${chargingStation.getChargePointSerialNumber()} created with success`);
                });
            } else {
                // Set data
                Utils.updateChargingStationObject(chargingStation.getModel(), chargingStationMongoDB);

                // No: Update it
                chargingStationMongoDB.save(function(err, results) {
                    if (err) {
                        console.log(`MongoDB: Error when updating Charging station ${chargingStation.getChargePointSerialNumber()}: ${err.message}`);
                        throw err;
                    }
                    console.log(`MongoDB: Charging station ${chargingStation.getChargePointSerialNumber()} updated with success`);
                });
            }
          }).catch(function(err) {
            console.log(`MongoDB: error in reading the chargin station ${chargingStation.getChargePointSerialNumber()}: ${err.message}`);
          });
    }

    getChargingStation(chargePointSerialNumber) {
        // Get
        return this._getChargingStationMongoDB(chargePointSerialNumber).then(function(chargingStationMongoDB) {
            var chargingStation = null;

            // Found
            if (chargingStationMongoDB != null) {
                // Create
                chargingStation = new ChargingStation(chargingStationMongoDB);
            }

            return chargingStation;
        }).catch(function(err) {
          console.log(`MongoDB: error in reading the chargin station ${chargePointSerialNumber}: ${err.message}`);
        });
    }

    _getChargingStationMongoDB(chargePointSerialNumber) {
        // Get the Charging Station
        return new Promise(function(fulfill, reject) {
            // Exec request
            MongoDBChargingStation.find({
                "chargePointSerialNumber": chargePointSerialNumber
            }, function(err, collection) {
                var chargingStationMongoDB = null;
                if (err) {
                    reject(err);
                } else {
                    // Check
                    if (collection.length > 0) {
                        chargingStationMongoDB = collection[0];
                    }
                    fulfill(chargingStationMongoDB);
                }
            });
        });
    }
}

module.exports = MongoDBStorage;
