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

            data = {
                "connectorId": "2",
                "transactionId": "0",
                "values": [{
                    "timestamp": "2017-02-02T14:43:41Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "90"
                    }
                }, {
                    "timestamp": "2017-02-02T14:43:56Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "181"
                    }
                }, {
                    "timestamp": "2017-02-02T14:44:11Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "271"
                    }
                }, {
                    "timestamp": "2017-02-02T14:44:26Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "361"
                    }
                }, {
                    "timestamp": "2017-02-02T14:44:27Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "0"
                    }
                }, {
                    "timestamp": "2017-02-02T14:44:41Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "91"
                    }
                }, {
                    "timestamp": "2017-02-02T14:44:56Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "181"
                    }
                }, {
                    "timestamp": "2017-02-02T14:45:11Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "272"
                    }
                }, {
                    "timestamp": "2017-02-02T14:45:26Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "362"
                    }
                }, {
                    "timestamp": "2017-02-02T14:45:27Z",
                    "value": {
                        "attributes": {
                            "unit": "Wh",
                            "location": "Outlet",
                            "measurand": "Energy.Active.Import.Register",
                            "format": "Raw",
                            "context": "Sample.Periodic"
                        },
                        "$value": "0"
                    }
                }],
                "chargeBoxIdentity": "EVLink-3",
                "endpoint": "192.168.0.115:8080/"
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
