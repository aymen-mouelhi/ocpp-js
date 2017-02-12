const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
      // TODO: store in log collection
        return new Promise(function(resolve, reject) {
            Storage.findAll('users').then(function(users){
              // Get user with idTag
              var user = users.filter(function(u) {
                  return u.idTag === data.idTag;
              });

              if (user) {
                // TODO: Store Notification
                // TODO: check if not expired
                  resolve({
                      AuthorizeResponse: {
                        idTagInfo: {
                            status: 'Accepted',
                            expiryDate: moment().add(1, 'months').format(),
                            parentIdTag: 'PARENT'
                        }
                      }
                    });
              } else {
                  // User not authorized
                  resolve({
                      AuthorizeResponse:{
                        idTagInfo: {
                            status: 'Invalid',
                            expiryDate: moment().subtract(1, 'months').format(),
                            parentIdTag: 'PARENT'
                        }
                      }
                    });
              }
            });
        });
    },

    cbHandle: function(data, callback){
      // TODO: Dummy Content
      callback({
          AuthorizeResponse: {
            idTagInfo: {
                status: 'Accepted',
                expiryDate: moment().add(1, 'months').format(),
                parentIdTag: 'PARENT'
            }
          }
        })
    }
}
