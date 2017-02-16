const Promise = require('promise');

module.exports = {
  handle: function(){
    return new Promise(function(resolve, reject) {
      resolve({
        heartbeatResponse: {
          currentTime: new Date().toISOString()
        }
      })
    });
  }
}
