var Utils = require('../../utils/utils');

class ChargingStation {
  constructor(chargingStation) {
    // Init the model
    this.model = {};

    // Set it
    Utils.updateChargingStationObject(chargingStation, this.model)
  }

  getChargePointVendor() {
    return this.model.chargePointVendor;
  }

  setChargePointVendor(chargePointVendor) {
    this.model.chargePointVendor = chargePointVendor;
  }

  getChargePointModel() {
    return this.model.chargePointModel;
  }

  setChargePointModel(chargePointModel) {
    this.model.chargePointModel = chargePointModel;
  }

  getChargePointSerialNumber() {
    return this.model.chargePointSerialNumber;
  }

  setChargePointSerialNumber(chargePointSerialNumber) {
    this.model.chargePointSerialNumber = chargePointSerialNumber;
  }

  getChargeBoxSerialNumber() {
    return this.model.chargeBoxSerialNumber;
  }

  setChargeBoxSerialNumber(chargeBoxSerialNumber) {
    this.model.chargeBoxSerialNumber = chargeBoxSerialNumber;
  }

  getFirmwareVersion() {
    return this.model.firmwareVersion;
  }

  setFirmwareVersion(firmwareVersion) {
    this.model.firmwareVersion = firmwareVersion;
  }

  getIccid() {
    return this.model.iccid;
  }

  setIccid(iccid) {
    this.model.iccid = iccid;
  }

  getImsi() {
    return this.model.imsi;
  }

  setImsi(imsi) {
    this.model.imsi = imsi;
  }

  getMeterType() {
    return this.model.meterType;
  }

  setMeterType(meterType) {
    this.model.meterType = meterType;
  }

  getMeterSerialNumber() {
    return this.model.meterSerialNumber;
  }

  setMeterSerialNumber(meterSerialNumber) {
    this.model.meterSerialNumber = meterSerialNumber;
  }

  getModel() {
    return this.model;
  }

  save() {
    return global.storage.saveChargingStation(this);
  }
}

module.exports = ChargingStation;
