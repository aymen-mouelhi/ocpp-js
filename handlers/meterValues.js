const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      /*
      // TODO: update Collections in firebase
      return firebase.database().ref('/stations/' + data.iccid).set(data).then(function(){
      });
      */
      resolve({});
    });
  },

  cbHandle: function(data, callback){
    // TODO: Dummy Content
    callback({
      status: 'Accepted'
    })
  }
}
