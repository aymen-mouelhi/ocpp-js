const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

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
  },

  cbHandle: function(data, callback){
    console.log('[BootNotification] cbHandle');
    Storage.save('stations', data).then(function(){
      console.log('[BootNotification] data stored in stations !')
      callback({
          status: 'Accepted',
          currentTime: new Date().toISOString(),
          heartbeatInterval: 1200
        });
    });
  }
}
