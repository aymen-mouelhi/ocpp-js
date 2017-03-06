const Promise = require('promise');
const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = Promise;

// Define Models
const stationSchema = new mongoose.Schema({
    chargeBoxIdentity: {
        type: 'String',
        required: true
    },
    endpoint: {
        type: 'String',
        required: true
    },
    chargePointVendor: 'String',
    chargePointModel: 'String',
    chargePointSerialNumber: 'String',
    chargeBoxSerialNumber: 'String',
    firmwareVersion: 'String',
    iccid: 'String',
    imsi: 'String',
    meterType: 'String',
    meterSerialNumber: 'String',
    status: String,
    consumption: Number,
    connectors: [{
        id: Number,
        status: String,
        consumption: Number
    }]
}, {
    strict: false
});

const notificationSchema = new mongoose.Schema({
    unread: {
        type: Boolean,
        required: true
    },
    connectorId: String,
    status: String,
    errorCode: String,
    timestamp: String,
    type: {
        type: Boolean,
        required: true
    }
}, {
    strict: false
});

var userSchema = new mongoose.Schema({
    idTag: {
        type: String,
        required: true
    },
    badgeNumber: {
        type: String,
        required: true
    },
    iNumber: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    name: {
      type: String,
    },
    plate: {
      type: String,
    },
    email: String,
    phone: String,
    mobile: String,
    contract:  {
        type: String,
        enum: ['Company Car', 'Private', 'Pool Car']
    },
    location: String,
    carStatus:  {
        type: String,
        enum: ['Ordered', 'Delivered', 'Prospection']
    },
    kiwhiPass: String,
    sodotrelPass: String,
    autolib: String,
    blib: String,
    autobleu: String
}, {
    strict: false
});


const meterValuesSchema = new mongoose.Schema({
    chargeBoxIdentity: {
        type: String,
        required: true
    },
    connectorId: {
        type: String,
        required: true
    },
    value: Number,
    timestamp: String
}, {
    strict: false
});

const transactionsSchema = new mongoose.Schema({
    idTag: {
        type: String,
        required: true
    },
    transactionId: {
        type: Number,
        required: true
    },
    chargeBoxIdentity: {
        type: String,
        required: true
    },
    connectorId: {
        type: Number,
        required: true
    },
    meterStart: String,
    reservationId: Number,
    timestamp: String
}, {
    strict: false
});

let instance =  null;
const Station = mongoose.model('Station', stationSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const MeterValues = mongoose.model('MeterValues', meterValuesSchema);
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionsSchema);

class MongoDB {
    constructor() {
        var mongoConf = config.get('mongodb');
        this.url = mongoConf.url;
        if(!instance){
          mongoose.connect(this.url);
          instance = this;
        }

        return instance;
    }

    _getModel(collection) {
        var Collection = null;
        switch (collection.toLowerCase()) {
            case 'notification':
                Collection = Notification;
                break;
            case 'station':
                Collection = Station;
                break;
            case 'metervalues':
                Collection = MeterValues;
                break;
            case 'transaction':
                Collection = Transaction;
                break;
            case 'users':
                Collection = User;
                break;
            default:
                console.log('[MongoDB] Collection ' + collection + ' is not known !');
                break;
        }
        return Collection;
    }

    findAll(collection, callback) {
      var self = this;
      self._getModel(collection).find({},callback);
    }

    findById(collection, id, callback) {
      var self = this;
      self._getModel(collection).find({chargePointSerialNumber: id}, function(err, stations){
        if(err){
          callback(err)
        }else{
          if(stations.length > 0){
              console.log('Found Station: ' + JSON.stringify(stations[0]));
              callback(null, stations[0]);
          }else{
            callback(null, {});
          }
        }
      });
    }

    save(collection, data, callback) {

      var self = this;

      var Model = self._getModel(collection);
      var entry = new Model(data);
      console.log('[MongoDB] saving data into '+ collection);
      console.log('[MongoDB] data '+ JSON.stringify(data));
      entry.save(function(err){
        if(err){
          console.log('[MongoDB] error: ' + err);
          callback(err);
        }else{
          if (collection.toLowerCase() === 'metervalues') {
            // When saving to metervalues, update station
            Station.find({chargeBoxIdentity: data.chargeBoxIdentity}, function(err, station){
              if(err){
                callback(err);
              }else{
                if(station){
                  station = station[0];

                  station.status = 'Charging';
                  var connectors;
                  // TODO: Update Formulae to calculate consumtion
                  station.consumption = 11;

                  if(station.connectors.length > 0){
                    connectors = station.connectors;
                  }else{
                    connectors = [{
                        id: 1,
                        status: 'Unkown',
                        consumption: '0 kW'
                    }, {
                        id: 2,
                        status: 'Unkown',
                        consumption: '0 kW'
                    }]
                  }

                  // TODO; Calculate Consumption for connector
                  for(var i = 0; i< connectors.length; i++){
                    if(connectors[i].id == data.connectorId){
                      connectors[i].status = 'Charging';
                      connectors[i].consumption = '11 kW';
                    }
                  }

                  station.connectors = connectors;

                  station.save(function(err){
                    if(err){
                      callback(err);
                    }else{
                      callback(null, {});
                    }
                  })
                }
              }
            })
          }else{
              callback(null, {});
          }
        }
      });
    }

    saveWithId(collection, id, data) {
      // Update
        var Model = self._getModel(collection);
        var self = this;
        return new Promise(function(resolve, reject) {
          self.findById(collection, id).then(function(found){
            if(found){
              var update = new Model(data);
              console.log('calling save')
              update.save(function(err){
                if(err){
                  reject(err)
                }else{
                  resolve({});
                }
              });
            }else{
              reject('Collection ' + collection +  'doesn\'t contain ' + id);
            }
          });
        });
    }
}

module.exports = MongoDB;
