const Promise = require('promise');
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // notification is not read yet
      data.unread = true;

      Storage.save('notifications',data).then(function(){
        resolve({});
      });
    });
  }
}
