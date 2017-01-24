const Promise = require('promise');
const ORM = require('../orm');

var Storage = new ORM(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            Storage.findAll('users').then(function(users){
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
