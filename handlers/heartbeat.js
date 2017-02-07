const Promise = require('promise');

module.exports = {
  handle: function(){
    return new Promise(function(resolve, reject) {
      resolve({
        HeartbeatResponse: {
          currentTime: new Date().toISOString()
        }
      })
    });
  },

  cbHandle: function(callback){
    callback({
      HeartbeatResponse: {
        currentTime: new Date().toISOString()
      }
    });
  }
}
