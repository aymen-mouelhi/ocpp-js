const firebase = require('firebase');
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

  save(collection, data){
    firebase
  }

  find(collection){

  }

  findById(collection, id){

  }

}

module.exports = firebase;
