const ip = require('ip');
const SOAPWrapper = require('../utils/SOAPWrapper');
const Utils = require('../utils/utils.js');

class ChargingPointServer {
    constructor(port=9221) {
        var self = this;
        this.port = port;
        this.ip = ip.address();
        this.soapWrapper = new SOAPWrapper(port, true);
        this.soapWrapper.createChargePointServer(port);

        console.log(`[ChargingPointServer] Server IP: ${self.ip}`);
    }
}

module.exports = ChargingPointServer;
