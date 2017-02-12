const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      // Store in Collection MeterValues
      Storage.save('meterValues', data, function(err){
        if (err) {
          console.log('error: ' + err);
          reject(err);
        }else{
          resolve({
            MeterValuesResponse: {}
          });
        }
      });
    });
  },

  cbHandle: function(data, callback){
    // TODO: Dummy Content
    callback({
        MeterValuesResponse: {}
      })
  }
}
