const firebase = require('../config/firebase');
const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {

            var transactionId = Utils.generateTransactionId();
            var start = true;
            var response = {};

            firebase.database().ref('/transactions').once('value').then(function(snapshot) {
              var transactions = snapshot.val();

                for (transaction in transactions) {
                    if (transaction.idTag === data.idTag) {
                        if (transaction.status === 'Accepted') {
                            // Still Charging
                            start = false;
                        }
                    }
                }

                // TODO: 0 should be replaced by transactionId
                if (start) {
                    response = {
                        transactionId: 0,
                        idTagInfo: {
                            status: 'Accepted',
                            expiryDate: moment().add(7, 'days').format(),
                            parentIdTag: 'PARENT'
                        }
                    }
                } else {
                    response = {
                        transactionId: 0,
                        idTagInfo: {
                            status: 'Rejected',
                            expiryDate: moment().add(7, 'days').format(),
                            parentIdTag: 'PARENT'
                        }
                    }
                }

                firebase.database().ref('/transactions/' + data.connectorId).set(data).then(function() {
                    // TODO: should we store a rejected transaction?
                    resolve(response);
                });

            });
        });
    }
}
