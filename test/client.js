const ChargingPoint = require('../entities/ChargingPoint');

var euriscoPoint = new ChargingPoint('http://127.0.0.1:8081/ChargeBox/Ocpp', "EURISCO-Simulator");
var nodePoint = new ChargingPoint('http://localhost:9221/Ocpp/ChargePointService', "NODE-Simulator");

var boot = setInterval(function() {

    // Station is ready
    euriscoPoint.bootNotification({
        chargePointVendor: 'Shneider Electric',
        chargePointModel: 'NQC-ACDC',
        chargePointSerialNumber: 'gir.vat.mx.000e48',
        chargeBoxSerialNumber: 'gir.vat.mx.000e48',
        firmwareVersion: '1.0.49',
        iccid: '1',
        imsi: '',
        meterType: 'DBT NQC-ACDC',
        meterSerialNumber: 'gir.vat.mx.000e48'
    });


    nodePoint.bootNotification({
        chargePointVendor: 'Shneider Electric',
        chargePointModel: 'NQC-ACDC',
        chargePointSerialNumber: '5894babc-c6a3-4b8d-81a70e48',
        chargeBoxSerialNumber: '5894babc-c6a3-4b8d-81a7',
        firmwareVersion: '2.0.49',
        iccid: '1',
        imsi: '',
        meterType: 'DBT NQC-ACDC',
        meterSerialNumber: 'gir.vat.mx.000e48'
    });

    /*
    // Send Meter Values
    point.meterValues({
        transactionId: 0,
        values: [{
            "timestamp": "2013-03-07T16:52:16Z",
            "values": [{
                "value": "0",
                "unit": "Wh",
                "measurand": "Energy.Active.Import.Register"
            }, {
                "value": "0",
                "unit": "varh",
                "measurand": "Energy.Reactive.Import.Register"
            }]
        }, {
            "timestamp": "2013-03-07T19:52:16Z",
            "values": [{
                "value": "20",
                "unit": "Wh",
                "measurand": "Energy.Active.Import.Register"
            }, {
                "value": "20",
                "unit": "varh",
                "measurand": "Energy.Reactive.Import.Register"
            }]
        }]
    });

    point.sendStatusNotification({
        status: 'Available',
        errorCode: 'NoError',
        info: "",
        timestamp: "2013-02-01T15:09:18Z",
        vendorId: "",
        vendorErrorCode: ""
    });

    point.diagnosticsStatusNotification({
        status: 'Uploaded'
    });

    point.firmwareStatusNotification({
        status: 'DownloadFailed'
    });

    point.startTransaction({
        idTag: 'B4F62CEF',
        timestamp: '2013-02-01T15:09:18Z',
        meterStart: 0
    });

    point.stopTransaction({
        transactionId: 0,
        idTag: 'B4F62CEF',
        timestamp: "2013-02-01T15:09:18Z",
        meterStop: 20,
        transactionData: [{
            "values": [{
                "timestamp": "2013-03-07T16:52:16Z",
                "values": [{
                    "value": "0",
                    "unit": "Wh",
                    "measurand": "Energy.Active.Import.Register"
                }, {
                    "value": "0",
                    "unit": "varh",
                    "measurand": "Energy.Reactive.Import.Register"
                }]
            }]
        }, {
            "values": [{
                "timestamp": "2013-03-07T16:52:16Z",
                "values": [{
                    "value": "0",
                    "unit": "Wh",
                    "measurand": "Energy.Active.Import.Register"
                }, {
                    "value": "0",
                    "unit": "varh",
                    "measurand": "Energy.Reactive.Import.Register"
                }]
            }]
        }]
    });
    */

    clearInterval(boot);
}, 3000);
