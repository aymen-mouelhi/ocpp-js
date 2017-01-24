const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')
const ORM = require('../orm');
var Storage = new ORM(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {

            var transactionId = Utils.generateTransactionId();
            var start = true;
            var response = {};

            Storage.findAll('transactions').then(function(transactions) {

              var userTransaction = transactions.filter(function(transaction){
                return transaction.idTag === data.idTag;
              });

                for (transaction in userTransaction) {
                  if (transaction.status === 'Accepted') {
                      // Still Charging
                      start = false;
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

                // save transaction
                Storage.saveOne('transactions', transactionId, data).then(function() {
                    // TODO: should we store a rejected transaction?
                    resolve(response);
                });
            });
        });
    }
}
