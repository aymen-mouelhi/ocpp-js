var soap = require('soap');
var url = 'https://raw.githubusercontent.com/aymen-mouelhi/ocpp-js/master/wsdl/ocpp_centralsystemservice_1.5_final.wsdl';

var xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');

var args = {
    chargePointVendor: 'Shneider Electric',
    chargePointModel: 'NQC-ACDC',
    chargePointSerialNumber: 'gir.vat.mx.000e48',
    chargeBoxSerialNumber: 'gir.vat.mx.000e48',
    firmwareVersion: '1.0.49',
    iccid: '1',
    imsi: '',
    meterType: 'DBT NQC-ACDC',
    meterSerialNumber: 'gir.vat.mx.000e48'
};

soap.createClient(url, { endpoint: 'http://127.0.0.1:9000/Ocpp/CentralSystemService'}, function(err, client) {
  if(client){
    console.log(client.describe());
    client.BootNotification(args, function(err, result) {
      if(err){
        console.log(err);
      }else{
        console.log(result);
      }
    });
  }else{
    console.log('soap client is not created ! ');
  }
});
