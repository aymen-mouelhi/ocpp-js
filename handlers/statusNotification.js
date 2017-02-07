const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // notification is not read yet
      data.unread = true;

      var notification = {
        text: 'Status Notification Update',
        unread: true,
        type: 'StatusNotification',
        timestamp: moment().format(),
        data: data
      }

      Storage.save('notification', notification, function(err){
        if(err){
          reject(err);
        }else{
          resolve({
            StatusNotificationResponse: {

            }
          });
        }
      });
    });
  },

  cbHandle: function(data, callback){
    Storage.save('notification', data, function(){
      callback(null, {
        StatusNotificationResponse: {}
      })
    });
  }
}
