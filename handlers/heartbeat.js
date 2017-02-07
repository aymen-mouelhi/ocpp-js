const Promise = require('promise');

module.exports = {
  handle: function(){
    return new Promise(function(resolve, reject) {
      resolve({
          currentTime: new Date().toISOString()
        })
    });
  },

  cbHandle: function(callback){
    callback({
        currentTime: new Date().toISOString()
      });
  }
}
