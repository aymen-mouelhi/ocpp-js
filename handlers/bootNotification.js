const firebase = require('firebase');

module.exports = {
  handle: function(data){
    // TODO: save data

    // Return Reponse
    // status can be Rejected or Accepted
    return {
        status: 'Accepted',
        currentTime: new Date().toISOString(),
        heartbeatInterval: 1200
      }
  }
}
