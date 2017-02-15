const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      data.unread = true;

      Storage.save('notification', data).then(function(){
        resolve({});
      });
    });
  }
}
