const firebase = require('../config/firebase');
const Promise = require('promise');
const ORM = require('../orm');

var storage = new ORM(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            storage.findAll('users').then(function(users){
              // Get user with idTag
              var user = users.filter(function(u) {
                  return u.idTag === data.idTag;
              });

              if (user) {
                // TODO: check if not expired
                  resolve({
                      idTagInfo: {
                          status: 'Accepted',
                          expiryDate: moment().add(1, 'months').format(),
                          parentIdTag: 'PARENT'
                      }
                  });
              } else {
                  // User not authorized
                  resolve({
                      idTagInfo: {
                          status: 'Invalid',
                          expiryDate: moment().subtract(1, 'months').format(),
                          parentIdTag: 'PARENT'
                      }
                  });
              }
            });
        });
    }
}
