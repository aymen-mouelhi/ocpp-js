const Promise = require('promise');
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station
    return new Promise(function(resolve, reject) {
      resolve({
        status: 'Accepted'
      });
    });
  },

  cbHandle: function(data, callback){
    callback({
        status: 'Accepted',
      })
  }
}
