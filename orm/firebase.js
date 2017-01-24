const Promise = require('promise');
const Storage = require('./index.js');

let instance =  null;
class FireBase {
  constructor() {


    this.firebase = require('firebase');
    var config = {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        databaseURL: process.env.databaseURL,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId
    };

    if(!instance){
      console.log('Firebase is set up !');
      this.firebase.initializeApp(config);
      instance = this;
    }

    return instance;
  }

  findAll(collection){
    return new Promise(function(resolve, reject) {
      return this.firebase.database().ref('/' + collection).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  findById(collection, id){
    return new Promise(function(resolve, reject) {
      this.firebase.database().ref('/' + collection + '/' + id).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  saveBatch(collection, data){
    return new Promise(function(resolve, reject) {
      return this.firebase.database().ref('/' + collection).set(data);
    });
  }

  saveOne(collection, id, data){
    return new Promise(function(resolve, reject) {
      return this.firebase.database().ref('/' + collection + '/' + id).set(data);
    });
  }

}

module.exports = FireBase;
