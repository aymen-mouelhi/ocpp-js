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
}, {
    strict: false
});

const notificationSchema = new mongoose.Schema({
    unread: {
        type: Boolean,
        required: true
    }
}, {
    strict: false
});


let instance =  null;
const Station = mongoose.model('Station', stationSchema);
const Notification = mongoose.model('Notification', notificationSchema);
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
                break
            default:
                console.log('[MongoDB] Collection ' + collection + ' is not known !');
                break;
        }
        return Collection;
    }

    findAll(collection, callback) {
      var self = this;
      self._getModel(collection).find({},callback);
      /*
      return new Promise(function(resolve, reject) {
        self._getModel(collection).find({}, function(err, data) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
        });
      });
      */
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
      /*
      return new Promise(function(resolve, reject) {
        self._getModel(collection).findById(id, function(err, data) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
        });
      });
      */
    }

    save(collection, data, callback) {
      var self = this;
      var Model = self._getModel(collection);
      var entry = new Model(data);
      console.log('[MongoDB] saving data into '+ collection);

      entry.save(function(err){
        if(err){
          callback(err);
        }else{
          callback(null, {});
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
