const firebase = require('../config/firebase');
const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            return firebase.database().ref('/transactions/' + data.connectorId).once('value').then(function(snapshot) {
                var transaction = snapshot.val();
                var response = {}

                if (transaction) {
                    if (transaction.status === 'Accepted') {
                        response = {
                            idTagInfo: {
                                status: 'Expired',
                                expiryDate: new Date().toISOString(),
                                parentIdTag: 'PARENT'
                            }
                        }
                    } else {
                        // Already stopped
                        // TODO: Update Status
                        response = {
                            idTagInfo: {
                                status: 'Expired',
                                expiryDate: new Date().toISOString(),
                                parentIdTag: 'PARENT'
                            }
                        }
                    }
                } else {
                    // TODO: Update Status
                    response = {
                        idTagInfo: {
                            status: 'Expired',
                            expiryDate: new Date().toISOString(),
                            parentIdTag: 'PARENT'
                        }
                    }
                }
                return firebase.database().ref('/transactions/' + data.connectorId).set(data).then(function() {
                    resolve(response);
                });
            });
        });
    }
}
