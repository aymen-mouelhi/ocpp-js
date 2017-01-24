const firebase = require('../config/firebase');
const Promise = require('promise');

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // notification is not read yet
      data.unread = true;

      return firebase.database().ref('/notifications/' + data.connectorId).set(data).then(function(){
        // Return Reponse
        resolve({});
      });
    });
  }
}
