const ChargingPoint = require('../entities/ChargingPoint');

var point = new ChargingPoint('ws://localhost:9000', "3lsonASjk1", protocol = "ocpp1.5", 'websocket');

var boot = setInterval(function(){
  point.bootNotification({
      chargePointVendor: "GIR",
      chargePointModel: "ocppjs-1.0.2"
    });
  clearInterval(boot);
}, 3000);
