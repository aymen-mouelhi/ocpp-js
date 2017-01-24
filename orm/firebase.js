const Promise = require('promise');
const Storage = require('./index.js');

let instance =  null;
class FireBase {
  constructor() {
    if(!instance){
      this.firebase = require('firebase');
      var config = {
          apiKey: process.env.apiKey,
          authDomain: process.env.authDomain,
          databaseURL: process.env.databaseURL,
          storageBucket: process.env.storageBucket,
          messagingSenderId: process.env.messagingSenderId
      };
      this.firebase.initializeApp(config);
      instance = this;
    }

    return instance;
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

  saveBatch(collection, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection).push(data).then(function(){
        resolve({});
      }).catch(function(error){
        console.log('Error while saving: ' + error);
        reject(error);
      });
    });
  }

  saveOne(collection, id, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection + '/' + id).set(data).then(function(){
        resolve({});
      });
    });
  }

}

module.exports = FireBase;
