const firebase = require('../config/firebase');
const Promise = require('promise');


module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {

      /*
      // TODO: update Collections in firebase
      return firebase.database().ref('/stations/' + data.iccid).set(data).then(function(){
        // Return Reponse
        // status can be Rejected or Accepted
        return {
            status: 'Accepted',
            currentTime: new Date().toISOString(),
            heartbeatInterval: 1200
          }
      });
      */
      resolve({});
    });
  }
}
