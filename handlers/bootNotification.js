const firebase = require('../config/firebase');
const Promise = require('promise');

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {

      // TODO: check that station deosn't exist
      return firebase.database().ref('/stations/' + data.iccid).set(data).then(function(){
        // Return Reponse
        // status can be Rejected or Accepted
        resolve({
            status: 'Accepted',
            currentTime: new Date().toISOString(),
            heartbeatInterval: 1200
          }) 
      });
    });
  }
}
