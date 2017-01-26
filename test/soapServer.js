var soap = require('soap');
var http = require('http');
var xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');
const handlers = require('../handlers');
const Utils = require('../utils/utils');

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

             },
             BootNotification: function(args, callback){
               /*
               // TODO: SOAP module doesn't accept promise
               return handlers.BootNotification.handle(args).then(function(data){
                 console.log('[SOAP Server] Data: ' + JSON.stringify(data));
                 return data;
               });
               */
               handlers.BootNotification.cbHandle(args, function(data){
                 callback(data);
               });
             },
             StartTransaction: function(args, callback){

             },
             StopTransaction: function(args, callback){

             },
             Heartbeat: function(args, callback){

             },
             MeterValues: function(args, callback){

             },
             StatusNotification: function(args, callback){

             },
             FirmwareStatusNotification: function(args, callback){

             },
             DiagnosticsStatusNotification: function(args, callback){

             },
             DataTransfer: function(args, callback){

             }
         }
     }
 };

// http server
var server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(9000, function(){
  console.log('SOAP Server is listening on port 9000');
});

// SOAP Server listener
var soapServer = soap.listen(server, '/Ocpp/CentralSystemService', centralService, xml);

soapServer.log = function(type, data) {
    // type is 'received' or 'replied'
    console.log(log = Utils.dateToString(d) + ' ['+ type +'] ' + JSON.stringify(data));
  };
