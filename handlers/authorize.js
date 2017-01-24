const firebase = require('../config/firebase');
const Promise = require('promise');

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {

            // TODO: is user authorized?
            firebase.database().ref('/users').once('value').then(function(snapshot) {
                var users = snapshot.val();

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
