const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // notification is not read yet
      data.unread = true;

      Storage.save('notifications',data).then(function(){
        resolve({});
      });
    });
  },

  cbHandle: function(data, callback){
    Storage.save('notifications',data).then(function(){
      callback({})
    });
  }
}
