const ChargingPoint = require('../entities/ChargingPoint');

var point = new ChargingPoint('ws://localhost:9000', "3lsonASjk1", protocol = "ocpp1.5", 'websocket');

var boot = setInterval(function(){
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
  clearInterval(boot);
}, 3000);
