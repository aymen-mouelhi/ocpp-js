var soap = require('soap');
var http = require('http');
const handlers = require('../handlers');
const Utils = require('../utils/utils');

var date = new Date();
var log = Utils.dateToString(date);

class SOAPWrapper {
  constructor(from) {
    if(from === 'system'){
      this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
      this.createServer();
    }else{
      this.xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_chargepointservice_1.5_final.wsdl', 'utf8');
      this.createServer();
      this.createClient();
    }
  }


  createServer(){
    // http server
    var server = http.createServer(function(request,response) {
        response.end(log + " 404: Not Found: " + request.url);
    });

    //TODO Check if port is used
    server.listen(9000, function(){
      console.log(log + ' SOAP Server is listening on port 9000');
    });
  }
}

var centralService = {
     CentralSystemService: {
         CentralSystemServiceSoap12: {
             MyFunction: function(args) {
                 return {
                     name: args.name
                 };
             },

             // This is how to define an asynchronous function.
             MyAsyncFunction: function(args, callback) {
                 // do some work
                 callback({
                     name: args.name
                 });
             },

             // This is how to receive incoming headers
             HeadersAwareFunction: function(args, cb, headers) {
                 return {
                     name: headers.Token
                 };
             },

             // You can also inspect the original `req`
             reallyDetailedFunction: function(args, cb, headers, req) {
                 console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                 return {
                     name: headers.Token
                 };
             },

             Authorize: function(args, callback){
               handlers.Authorize.cbHandle(args, function(data){
                 callback(data);
               });
             },
             BootNotification: function(args, callback){
               handlers.BootNotification.cbHandle(args, function(data){
                 callback(data);
               });
             },
             StartTransaction: function(args, callback){
               handlers.StartTransaction.cbHandle(args, function(data){
                 callback(data);
               });
             },
             StopTransaction: function(args, callback){
               handlers.StopTransaction.cbHandle(args, function(data){
                 callback(data);
               });
             },
             Heartbeat: function(args, callback){
               handlers.Heartbeat.cbHandle(function(data){
                 callback(data);
               });
             },
             MeterValues: function(args, callback){
               handlers.MeterValues.cbHandle(args, function(data){
                 callback(data);
               });
             },
             StatusNotification: function(args, callback){
               handlers.StatusNotification.cbHandle(args, function(data){
                 callback(data);
               });
             },
             FirmwareStatusNotification: function(args, callback){
               handlers.FirmwareStatusNotification.cbHandle(args, function(data){
                 callback(data);
               });
             },
             DiagnosticsStatusNotification: function(args, callback){
               handlers.DiagnosticsStatusNotification.cbHandle(args, function(data){
                 callback(data);
               });
             },
             DataTransfer: function(args, callback){
               handlers.DataTransfer.cbHandle(args, function(data){
                 callback(data);
               });
             }
         }
     }
 };







// SOAP Server listener
var soapServer = soap.listen(server, '/Ocpp/CentralSystemService', centralService, xml);

soapServer.log = function(type, data) {
    // type is 'received' or 'replied'
    console.log(log + ' ['+ type +'] ' + JSON.stringify(data));
  };
