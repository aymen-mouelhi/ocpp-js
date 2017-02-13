const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

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
                      StartTransactionResponse: {
                          transactionId: 1,
                          idTagInfo: {
                              status: 'Accepted'
                          }
                      }
                    }
                } else {
                    response = {
                      StartTransactionResponse: {
                          transactionId: 1,
                          idTagInfo: {
                              status: 'Rejected',
                              expiryDate: moment().add(7, 'days').format(),
                              parentIdTag: 'PARENT'
                          }
                      }
                    }
                }

                // save transaction
                Storage.saveWithId('transactions', transactionId, data, function() {
                    // TODO: should we store a rejected transaction?
                    resolve(response);
                });
            });
        });
    },

    cbHandle: function(data, callback){
      // TODO: Dummy Content
      callback({
        StartTransactionResponse: {
            transactionId: 1,
            idTagInfo: {
                status: 'Accepted'
            }
        }
      })
    }
}
