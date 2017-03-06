const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // notification is not read yet
      data.unread = true;
      /*
      Storage.findAll('notification', function(err, notifications){

        var statusNotifications = notifications.filter(function(item){
          return item.type === 'StatusNotification';
        });

        // TODO: order by timestamp
        var statusNotif = statusNotifications[0];
        // TODO: Check status
        if (statusNotif.status != data.status) {
          if ((statusNotif.connectorId === data.connectorId)) {
            // Status has changed, store notification !
          }else{
            // Store notification
          }
        }else{
          if ((statusNotif.connectorId === data.connectorId)) {
            // Status has changed, store notification !
          }else{
            // same status, nothing to do
          }
        }

      });
      */

      var notification = {
        station: {
          endpoint: data.endpoint,
          chargeBoxIdentity: data.chargeBoxIdentity
        }
        text: 'Status Notification Update',
        unread: true,
        type: 'StatusNotification',
        timestamp: data.timestamp,
        status: data.status,
        connectorId: data.connectorId,
        errorCode: data.errorCode
      }

      Storage.save('notification', notification, function(err){
        if(err){
          reject(err);
        }else{
          resolve({
            StatusNotificationResponse: {}
          });
        }
      });
    });
  }
}
