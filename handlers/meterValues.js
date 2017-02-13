const Promise = require('promise');
const async = require('async');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            if (data.values.length > 0) {
                // TODO: Store data.values.length times?
            }

            var parsed = JSON.parse(JSON.stringify(data), function(k, v) {
                if (k === "$value") {
                    this.value = v;
                } else {
                    return v;
                }
            });
            // Store in Collection MeterValues
            Storage.save('meterValues', parsed, function(err) {
                if (err) {
                    console.log('error: ' + err);
                    reject(err);
                } else {
                    resolve({
                        MeterValuesResponse: {}
                    });
                }
            });
        });
    },

    cbHandle: function(data, callback) {
        // TODO: Dummy Content
        callback({
            MeterValuesResponse: {}
        })
    }
}
