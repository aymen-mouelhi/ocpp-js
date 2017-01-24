const ChargingPoint = require('../entities/ChargingPoint');

var point = new ChargingPoint('ws://localhost:9000', "3lsonASjk1", protocol = "ocpp1.5", 'websocket');

var boot = setInterval(function() {
    // Station is ready
    point.bootNotification({
        chargePointVendor: 'DBT',
        chargePointModel: 'NQC-ACDC',
        chargePointSerialNumber: 'gir.vat.mx.000e48',
        chargeBoxSerialNumber: 'gir.vat.mx.000e48',
        firmwareVersion: '1.0.49',
        iccid: '1',
        imsi: '',
        meterType: 'DBT NQC-ACDC',
        meterSerialNumber: 'gir.vat.mx.000e48'
    });

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
    clearInterval(boot);
}, 3000);
