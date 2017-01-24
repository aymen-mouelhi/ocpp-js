const Promise = require('promise');
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

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
  }
}
