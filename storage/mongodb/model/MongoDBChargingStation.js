var mongoose = require('mongoose');

module.exports = mongoose.model('ChargingStation',{
  chargePointVendor: String,
  chargePointModel: String,
  chargePointSerialNumber: String,
  chargeBoxSerialNumber: String,
  firmwareVersion: String,
  iccid: String,
  imsi: String,
  meterType: String,
  meterSerialNumber: String
});
