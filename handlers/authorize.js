const Promise = require('promise');
const moment = require('moment');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            Storage.findAll('users', function(err, users){
              // Get user with idTag
              var user = users.filter(function(u) {
                  return u.idTag === data.idTag;
              })[0];

              console.log(`User: ${JSON.stringify(user)} for idTag ${data.idTag}`);

              if (user) {

                var name = user.name.split(' ');
                var firstName = name[0];
                var lastName = name[1];

                var message = `${firstName} ${lastName} is now authenticated on station ${data.chargeBoxIdentity}`;

                var notification = {
                  text: message,
                  unread: true,
                  type: 'Authorize',
                  timestamp: moment().format()
                }

                Storage.save('notification', notification, function(err){
                  if(err){
                    reject(err);
                  }else{
                    // TODO: check if not expired [Issue #6]
                    resolve({
                        AuthorizeResponse: {
                          idTagInfo: {
                              status: 'Accepted',
                              expiryDate: moment().add(1, 'months').format(),
                              parentIdTag: 'PARENT'
                          }
                        }
                      });
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
    }
}
