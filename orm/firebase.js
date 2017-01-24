const firebase = require('firebase');
const Promise = require('promise');
const Storage = require('./index.js');

class FireBase extends Storage {
  constructor() {
    this.super();
    var config = {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        databaseURL: process.env.databaseURL,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId
    };

    // TODO: handle firebase Authentication
    firebase.initializeApp(config);
  }

  findAll(collection){
    return new Promise(function(resolve, reject) {
      firebase.database().ref('/' + collection).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  findById(collection, id){
    firebase.database().ref('/' + collection + '/' + id).once('value').then(function(snapshot){
      var data = snapshot.val();
      resolve(data);
    }).catch(function(error){
      reject(error);
    });
  }

  save(collection, data){
    return new Promise(function(resolve, reject) {
      return firebase.database().ref('/' + collection + '/').set(data);
    });
  }

  update(collection, id, data){
    return new Promise(function(resolve, reject) {
      return firebase.database().ref('/' + collection + '/' + id).set(data);
    });
  }

}

module.exports = FireBase;
