const Promise = require('promise');
const mongoose = require('mongoose');

// Define Models
const stationSchema = new mongoose.Schema({
  chargeBoxIdentity: {type: 'String', required: true },
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
  unread: { type: Boolean, required: true },
}, { strict: false });

class MongoDB {
  constructor() {
    mongoose.connect('mongodb://localhost/myappdatabase');
  }

  findAll(collection){
    var self = this;
    return new Promise(function(resolve, reject) {
      return self.firebase.database().ref('/' + collection).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  findById(collection, id){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection + '/' + id).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  save(collection, data){
    var self = this;

    return new Promise(function(resolve, reject) {

      resolve();
    });
  }

  saveWithId(collection, id, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection + '/' + id).set(data).then(function(){
        resolve({});
      });
    });
  }
}
