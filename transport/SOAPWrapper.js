const fs = require('fs');
const HTTPServerWrapper =  require('./HTTPServerWrapper');
const soap = require('../lib/soap');
const Config = require('../config/config.js');
var Utils = require('../utils/utils.js');
const handlersFolder = '../handlers/';

/**
 *  SOAPWrapper
 *
 *  @attr mode : server or client
 */

var SOAPWrapper = function(transportLayer, from, mode, soapOptions) {
  this.httpServer = null;
  this.client = null;
  this.transportLayer = transportLayer;
  this.cbId = transportLayer.simulator.chargePointId;
  this.fromHeader = soapOptions && soapOptions.fromHeader;
  this.from = from;
  this.to = from == 'cs' ? 'cp' : 'cs';
  this.soapServ = null;

  this.port = null;
  this.services = null;
  this.endpoint = null;
  this.soapService = {};

  // pointer to soap lib response
  this.res = null;
  this.wsdl = null;

  this.uri = null;
  if(this.from == 'cp')
    this.uri = this.transportLayer.simulator.uri;
  else
    this.uri = soapOptions && soapOptions.fromHeader;

  if(this.from == 'cs') {
    this.soapService.CentralSystemService = {
        CentralSystemServiceSoap12: {}
      };
    this.port = this.transportLayer.simulator.port;
    this.services = this.soapService.CentralSystemService.
      CentralSystemServiceSoap12;
    this.endpoint = Config.ENDPOINTURL;
  }
  else {
    this.soapService.ChargePointService = {
        ChargePointServiceSoap12: {}
      };

    // TODO better check for retrieving port and endpoint url
    this.port = soapOptions.remoteActionPort;
    this.services = this.soapService.ChargePointService.
      ChargePointServiceSoap12;
    this.endpoint = this.fromHeader &&
      this.fromHeader.split(':')[2].split('/')[1] || '/';
  }

  if(mode == 'server') {
    this.createService();
  }
  else {
    this.createClient();

    if(this.from == 'cp') {
      this.createService();
    }
  }
};

SOAPWrapper.prototype = {

  createService: function() {
    var version = this.retrieveVersion(Config.SUB_PROTOCOL);
    //var procedures = Config.procedures[version][this.from];
    var _this = this;

    fs.readdir(handlersFolder, (err, files) => {
      files.forEach(file => {
        console.log(file);
        this.services[file] = (function(p) {
          return function(requestBody) {
            // callHeaders might return a response object,
            // otherwise, pick the default reponse
              var handler = require('../handlers/' + p);

              if (handler.handle != undefined) {
                handler.handle(params).then(function(values){
                    return values;
                });
              }
          };
        })(file);
      });
    });

    /*
    // stock procedures responses
    for(var p in procedures) {
      this.services[p] = (function(p) {
        return function(requestBody) {
          // callHeaders might return a response object,
          // otherwise, pick the default reponse
            var handler = require('../handlers/' + p);

            if (handler.handle != undefined) {
              handler.handle(params).then(function(values){
                  return values;
              });
            }
        };
      })(p);
    }
    */

    var file = Config.WSDL_FILES[this.from +'_'+ version];
    var xml = require('fs').readFileSync(__dirname +'/../'+ file, 'utf8');
    var server = new HTTPServerWrapper().httpServer;

    server.listen(this.port);

    if(server.address() == undefined) {
      console.log('Error: cannot listen on port '+ this.port +'.');
      console.log('Program interrupted.')
      process.exit(1);
      return;
    }

    this.port = server.address().port;
    Utils.log('SOAP Server listening on port '+ this.port, 'cs');

    this.soapServ = soap.listen(server, this.endpoint, this.soapService, xml);

    soap.WSDL.WITH_ATTR_AT = Config.WITH_ATTR_AT;
    soap.WSDL.PROTOCOL_VERSION = version;

    var _this = this;
    this.soapServ.checkErrors = function(result, res) {
      _this.res = res;
      _this.wsdl = this.wsdl;

      var obj = this.wsdl.xmlToObject(result);
      if(!obj) {
        _this._returnError('', '', "FormationViolation");
        return;
      }

      var args = {},
          procName = obj.Header.Action.slice(1),
          name = procName.toLowerCase(),
          version = Utils.retrieveVersion(Config.SUB_PROTOCOL),
          model = _this.from,
          from = _this.to,
          m_params = {};

      // retrieve body
      for(var b in obj.Body) { args = obj.Body[b]; break; };

      if(Config.methodTree[version] != undefined
        && Config.methodTree[version][model] != undefined) {
        // if exists
        if(Config.methodTree[version][model][name] != undefined) {
          m_params = Config.methodTree[version][model][name]
            [procName + 'Request'];
        }
        else {
          //this._returnError(from, callId, "NotImplemented");
          return;
        }

        var params = Utils.clone(m_params);

        // infos for the CheckPayload function
        var infos = {
          //callId: callId,
          from: from,
          model: model,
          version: version
        };

        return Config.checkPayload(args, params, infos, _this);
      }

      // no method = error
      return false;
    };
  },

  createClient: function() {

    var _this = this,
        version = Utils.retrieveVersion(Config.SUB_PROTOCOL),
        file = __dirname +'/../'+ Config.WSDL_FILES[this.to +'_'+ version];

    this.transportLayer.simulator.clientConnection = this;

    var options = {
      endpoint: this.uri
    };

    soap.createClient(file, options, function(err, client) {
      _this.client = client;

      // Add headers

      if(_this.from != 'cs') {
        _this.client.addSoapHeader({
          chargeBoxIdentity: _this.transportLayer.simulator.chargePointId
        }, '', 'tns'); // TODO change tns by namespace defined in wsdl
      }

      _this.client.addSoapHeader({
        To: _this.transportLayer.simulator.uri
          || _this.transportLayer.layer.fromHeader,
      }, '', 'wsa5');

    });
  },

  /**
   *  HTTP Request
   */
  _httpRequest: function(content) {
    var _this = this,
        urlObj = url.parse(this.uri),
        content = content.slice(1, content.length-1);

    var options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.path,
      method: 'POST',
      headers: {
        'Content-Length': content.length,
        'Content-Type': 'application/soap+xml'
      }
    };

    var req = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        var msg = '<<'+ _this.to +':\n';
        if(Transport.PRINT_HEADERS) {
          msg += 'HTTP headers: '+ JSON.stringify(res.headers) + '\n';
        }
        msg += chunk;

        Utils.log(msg, _this.from == 'cp' ? _this.cbId : 'cs');
      });
    });

    req.write(content);
    req.end();

    var msg = '>>'+ _this.to +':\n';
    if(Transport.PRINT_HEADERS) {
      msg += 'HTTP headers: '+ JSON.stringify(options.headers) + '\n';
    }
    msg += content;
    Utils.log(msg, _this.from == 'cp' ? _this.cbId : 'cs');
  },

  /**
   *  SOAP RPC Call
   */
  rpcCall: function(procName, args, timeout, result, options) {
    // if send_raw
    if(procName == '' && typeof args == 'string') {
      this._httpRequest(args);
      return;
    }

    var _this = this,
        from = options.to == 'cs' ? _this.transportLayer.simulator.chargePointId
          : 'cs';

    if(this.fromHeader == null) {
      var host = this.uri.indexOf('localhost') > 0 ?
          'localhost' : Transport.NETWORK_IP;

      this.fromHeader = 'http://'+ host +':'+ this.port +'/';

      this.client.addSoapHeader({
        From: {
          Address: this.fromHeader
        }
      }, '', 'wsa5');
    }

    if(!Transport.PRINT_XML)
      Utils.log(">>"+ options.to + " /"+ procName  +" "+ JSON.stringify(args),
        from);

    // delete last Action header
    if(this.client.soapHeaders[this.client.soapHeaders.length - 1]
      .indexOf(':Action') > -1)
      this.client.soapHeaders.pop();

    // delete last chargeBoxIdentity header
    if(this.client.soapHeaders[this.client.soapHeaders.length - 1]
      .indexOf('chargeBoxIdentity') > -1)
      this.client.soapHeaders.pop();

    // if remote action
    if (this.from == 'cs') {
      // Add soap header
      this.client.addSoapHeader({
        chargeBoxIdentity: options.to.split('#')[1]
      }, '', 'tns');
    }

    // Add Action Header
    this.client.addSoapHeader({
      Action: '/'+ procName
    }, '', 'wsa5');

    // Call
    this.client[procName](args, function(err, result) {
      if(result == null) {
        Utils.log("<<"+ options.to +" Error: can't reach "+ _this.uri, from);
        return;
      }

      var msg = Transport.PRINT_XML
        ? _this.client.lastResponse
        : JSON.stringify(result);

      // if lib doesn't correctly parse response
      if(result.body != undefined) {
        Utils.log("<<"+ options.to
          +" Error: cannot parse response, raw content: "+
          JSON.stringify(result.body), from);
      }
      else {
        Utils.log("<<"+ options.to +" /"+ procName +" "+ msg, from);

        // call plugins result handlers
        Plugins.callResultHandlers(procName, result, this);

        // idle
        Plugins.callIdleHandlers(this);
      }
    });

    if(Transport.PRINT_XML)
      Utils.log(">>"+ options.to +" "+ this.client.lastRequest,
        from);
  },

  _returnError: function(from, callId, errorName, errorDesc) {
    var to = from == 'cs' ? 'cp' : 'cs',
        obj = {
          "SOAP-ENV:Body": {
            "SOAP-ENV:Fault": {
              "SOAP-ENV:Code": {
                "SOAP-ENV:Value": "SOAP-ENV:Sender",
                "SOAP-ENV:Subcode": {
                  "SOAP-ENV:Value": errorName
                },
              },
              "SOAP-ENV:Reason": {
                "SOAP-ENV:Text": errorDesc || ''
              }
            }
          }
        };

    var msg = this.soapServ._envelope(this.wsdl.objectToXML(obj));

    //Utils.log('>>'+ from +' \n'+ msg, from);

    this.res.write(msg);
    this.res.end();
  },

  retrieveVersion(str) {
      // if array, last occurence
      if (str instanceof Array) {
          str = str[str.length - 1];
      }

      var v = [];
      for (var i in str) {
          if (str[i] >= 0 && str[i] < 10) {
              v.push(str[i]);
          }
      }
      return v.join('.');
  }

};

module.exports = SOAPWrapper;
