const firebase = require('../config/firebase');
const Promise = require('promise');


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
