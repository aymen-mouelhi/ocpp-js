const Promise = require('promise');
const mongoose = require('mongoose');

// Define Models
const stationSchema = new mongoose.Schema({
    chargeBoxIdentity: {
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
    meterSerialNumber: 'String'
});

const notificationSchema = new mongoose.Schema({
    unread: {
        type: Boolean,
        required: true
    },
}, {
    strict: false
});

const Station = mongoose.model('Station', stationSchema);
const Notification = mongoose.model('Notification', notificationSchema);

class MongoDB {
    constructor() {
        this.url = process.env.mongoUrl || 'mongodb://localhost/myappdatabase';
        mongoose.connect(this.url);
    }

    _getModel(collection) {
        var Collection = null;
        switch (collection.toLowerCase()) {
            case 'notification':
                Collection = new Notification();
                break;
            case 'station':
                Collection = new Station();
                break
            default:
                console.log('[MongoDB] Collection ' + collection + ' is not known !');
                break;
        }
        return Collection;
    }

    findAll(collection) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self._getModel(collection).find({}, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
      });
    }

    findById(collection, id) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self._getModel(collection).findById(id, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                });
        });
      });
    }

    save(collection, data) {
        var self = this;
        var Model = self._getModel(collection);
        return new Promise(function(resolve, reject) {
          var entry = new Model(data);
          entry.save(function(err){
            if(err){
              reject(err)
            }else{
              resolve({});
            }
          });
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
