const firebase = require('../config/firebase');
const Promise = require('promise');

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      console.log('in status notification !');
      // TODO: check that station deosn't exist
      return firebase.database().ref('/notifications/' + data.connectorId).set(data).then(function(){
        // Return Reponse
        // status can be Rejected or Accepted
        resolve({});
      });
    });
  }
}
