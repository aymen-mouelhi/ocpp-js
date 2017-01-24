const firebase = require('../config/firebase');
const Promise = require('promise');
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {

      // TODO: check that station doesn't exist
      Storage.save('stations', data).then(function(){
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
