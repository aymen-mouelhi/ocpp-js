const Promise = require('promise');
const moment = require('moment');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // Create Notification
      var message = data.chargeBoxIdentity + ' has just started';

      var notification = {
        text: message,
        unread: true,
        createdOn: moment().format()
      }

      Storage.findAll('station').then(function(stations){
        var station = stations.filter(function(item){
          return item.chargePointSerialNumber === data.chargePointSerialNumber;
        });

        if(station){
          // Station already exists
          Storage.save('notification', notification, function(err){
            if(err){
              reject(err);
            }else{
              resolve({});
            }
          });
        }else{
          Storage.save('notification', notification, function(err){
            if(err){
              reject(err);
            }else{
              Storage.save('station', data, function(err){
                if(err){
                  resolve({
                      status: 'Rejected',
                      currentTime: new Date().toISOString(),
                      heartbeatInterval: 1200
                    });
                }else{
                  // Return Reponse
                  // status can be Rejected or Accepted
                  resolve({
                      status: 'Accepted',
                      currentTime: new Date().toISOString(),
                      heartbeatInterval: 1200
                    });
                }
              });
            }
          });
        }
      });
    });
  },

  cbHandle: function(data, callback){
    console.log('[BootNotification] cbHandle');
    Storage.save('station', data, function(){
      console.log('[BootNotification] data stored in stations !')
      callback({
          status: 'Accepted',
          currentTime: new Date().toISOString(),
          heartbeatInterval: 1200
        });
    });
  }
}
