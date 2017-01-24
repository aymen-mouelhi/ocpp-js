const firebase = require('firebase');
const Promise = require('promise');

var config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
  };

// TODO: handle firebase Authentication
firebase.initializeApp(config);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {

      // TODO: check that station deosn't exist
      return firebase.database().ref('/stations/' + data.iccid).set(data).then(function(){
        // Return Reponse
        // status can be Rejected or Accepted
        return {
            status: 'Accepted',
            currentTime: new Date().toISOString(),
            heartbeatInterval: 1200
          }
      });
    });
  }
}
