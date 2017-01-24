const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js');
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            Storage.findById('transactions', data.transactionId).then(function(transactions) {
                if (transactions) {
                    var transaction = transactions[0];

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
                    // store transaction details
                    Storage.saveWithId('transactions', data.transactionId, data).then(function() {
                        resolve(response);
                    });

                } else {
                    // Transaction doesn't exist
                    resolve({
                        idTagInfo: {
                            status: 'Expired',
                            expiryDate: new Date().toISOString(),
                            parentIdTag: 'PARENT'
                        }
                    });
                }
            });
        });
    }
}
