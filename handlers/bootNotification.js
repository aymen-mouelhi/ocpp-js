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
        type: 'BootNotification',
        timestamp: moment().format()
      }

      console.log('[BootNotification] notification: ' + JSON.stringify(notification))

      Storage.findAll('station', function(err, stations){
        if(err){
          reject(err);
        }

        var station = stations.filter(function(item){
          return item.chargePointSerialNumber === data.chargePointSerialNumber;
        });

        console.log('[BootNotification] Station: ' + JSON.stringify(station))

        if(station.hasOwnProperty('chargeBoxIdentity')){
          // Station already exists
          Storage.save('notification', notification, function(err){
            if(err){
              reject(err);
            }else{
              resolve({
                bootNotificationResponse : {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    heartbeatInterval: 1200
                  }
              });
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
                    bootNotificationResponse : {
                        status: 'Accepted',
                        currentTime: new Date().toISOString(),
                        heartbeatInterval: 1200
                      }
                  });
                }else{
                  // Return Reponse
                  // status can be Rejected or Accepted
                  resolve({
                    bootNotificationResponse : {
                        status: 'Accepted',
                        currentTime: new Date().toISOString(),
                        heartbeatInterval: 1200
                      }
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
