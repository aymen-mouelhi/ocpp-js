const firebase = require('../config/firebase');
const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      return firebase.database().ref('/transactions/' + data.connectorId).set(data).then(function(){
        // TODO: check if we can have a transaction for given idTag
        resolve({
          idTagInfo: {
            status: 'Expired',
            expiryDate:new Date().toISOString(),
            parentIdTag: 'PARENT'
          }
        });
      });
    });
  }
}
