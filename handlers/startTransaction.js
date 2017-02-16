const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            var start = true;
            var response = {};
            var transactionId = 0;

            Storage.findAll('transaction', function(err, transactions) {
                if (err) {
                    reject(err);
                }

                // TODO: TransactionId = last transactionId + 1
                // Maybe it should be linked to the chargeBoxIdentity

                if (transactions.length > 0) {
                    transactionId = transactions.length + 1;
                } else {
                    transactionId = 1;
                }

                var userTransaction = transactions.filter(function(transaction) {
                    return transaction.idTag === data.idTag;
                });

                // TODO: to bec checked, start transaction are often sent?
                for (transaction in userTransaction) {
                    if (transaction.status === 'Accepted') {
                        // Still Charging
                        start = false;
                    }
                }
                if (start) {
                    response = {
                        StartTransactionResponse: {
                            transactionId: transactionId,
                            idTagInfo: {
                                status: 'Accepted'
                            }
                        }
                    }
                } else {
                    response = {
                        StartTransactionResponse: {
                            transactionId: transactionId,
                            idTagInfo: {
                                status: 'Rejected',
                                expiryDate: moment().add(7, 'days').format(),
                                parentIdTag: 'PARENT'
                            }
                        }
                    }
                }

                data.transactionId = transactionId;

                // save transaction
                Storage.save('transaction', data, function(err) {
                    if (err) {
                        reject(err);
                    }
                    // TODO: should we store a rejected transaction?
                    resolve(response);
                });
            });
        });
    }
}
