/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

function findKey(obj, val) {
    for (var n in obj) if (obj[n] === val) return n;
}

var url = require('url'),
    compress = null;

try { compress = require("compress"); } catch(e) {}

var Server = function(server, path, services, wsdl) {
    var self = this,
        listeners = server.listeners('request');

    this.services = services;
    this.wsdl = wsdl;
    if (path[path.length-1] != '/') path += '/';
    wsdl.onReady(function(err) {
        server.removeAllListeners('request');
        server.addListener('request', function(req, res) {
            if (typeof self.authorizeConnection === 'function') {
              if (!self.authorizeConnection(req.connection.remoteAddress)) {
                res.end();
                return;
              }
            }
            var reqPath = url.parse(req.url).pathname;
            if (reqPath[reqPath.length-1] != '/') reqPath += '/';
            if (path === reqPath) {
                self._requestListener(req, res);
            }
            else {
                for (var i = 0, len = listeners.length; i < len; i++){
                  listeners[i].call(this, req, res);
                }
            }
        });
    })
}

// XXX modif lib: check error function
Server.prototype.checkError = function(result) {

};

// XXX modif lib: check error function
Server.prototype._returnError = function(result) {

};

Server.prototype._requestListener = function(req, res) {
    var self = this;
    if (req.method === 'GET') {
        var search = url.parse(req.url).search;
        if (search && search.toLowerCase() === '?wsdl') {
            res.setHeader("Content-Type", "application/xml");
            res.write(self.wsdl.toXML());
        }
        res.end();
    }
    else if (req.method === 'POST') {
        res.setHeader('Content-Type', req.headers['content-type']);
        var chunks = [], gunzip;
        if (compress && req.headers["content-encoding"] == "gzip") {
            gunzip = new compress.Gunzip;
            gunzip.init();
        }
        req.on('data', function(chunk) {
            if (gunzip) chunk = gunzip.inflate(chunk, "binary");
            chunks.push(chunk);
        })
        req.on('end', function() {
            var xml = chunks.join(''), result;
            if (gunzip) {
                gunzip.end();
                gunzip = null;
            }
            try {
                self.log(xml, 'in');

                // XXX modif lib: for checking errors
                if(!self.checkErrors(xml, res)) {
                  self._process(xml, req.url, function(result) {
                      res.write(result);
                      res.end();

                      self.log(result, 'out');
                  });
                }
            }
            catch(err) {
            console.log(err)
                err = err.stack || err;
                res.write(err);
                res.end();
                if (typeof self.log === 'function') {
                  self.log("error", err);
                }
            }
        });
    }
    else {
        res.end();
    }
}

// XXX modif lib
Server.prototype.setRemoteAddress = function(address) {
  // to be overridden
};

// XXX modif lib
Server.prototype.postProcess = function(address) {
  // to be overridden
};

Server.prototype._process = function(input, URL, callback) {
    var self = this,
        pathname = url.parse(URL).pathname.replace(/\/$/,''),
        obj = this.wsdl.xmlToObject(input),
        body = obj.Body,
        bindings = this.wsdl.definitions.bindings, binding,
        methods, method, methodName,
        serviceName, portName;

    if (typeof self.authenticate === 'function') {
      if (obj.Header == null || obj.Header.Security == null) {
        throw new Error('No security header');
      }
      if (!self.authenticate(obj.Header.Security)) {
        throw new Error('Invalid username or password');
      }
    }

    // XXX modif lib: get remote address
    self.setRemoteAddress(obj.Header.chargeBoxIdentity,
      obj.Header.From && obj.Header.From.Address,
      obj.Header.Action.slice(1));

    // XXX modif lib: for adding chargeboxidentity header
    this.cbId = obj.Header.chargeBoxIdentity;
    this.action = obj.Header.Action;
    this.messageId = obj.Header.MessageID;

    // use port.location and current url to find the right binding
    binding = (function(self){
        var services = self.wsdl.definitions.services;
        for(serviceName in services) {
            var service = services[serviceName];
            var ports = service.ports;
            for(portName in ports) {
                var port = ports[portName];
                var portPathname = url.parse(port.location).pathname.replace(/\/$/,'');
                // XXX modif lib: permit customized endpoint URL
                //if(portPathname===pathname)
                    return port.binding;
            }
        }
    })(this);

    methods = binding.methods;

// XXX modif lib: always rpc
//          if(binding.style === 'rpc') {
// XXX end
            methodName = Object.keys(body)[0];

body = body[methodName];

// XXX modif lib: OCPP Command = Command / CommandResponse
methodName = methodName.replace('Request','');
methodName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
// XXX end

            self._executeMethod({
                serviceName: serviceName,
                portName: portName,
                methodName: methodName,
                outputName: methodName + 'Response',
                // XXX modif lib: body instead of body[methodName]
                args: body,
                style: 'rpc'
            }, callback);

            self.postProcess();

/* XXX modif lib: always use RPC
} else {
            var messageElemName = Object.keys(body)[0];
            var pair = binding.topElements[messageElemName];
            self._executeMethod({
                serviceName: serviceName,
                portName: portName,
                methodName: pair.methodName,
                outputName: pair.outputName,
                args: body[messageElemName],
                style: 'document'
            }, callback);
        }
*/

}

Server.prototype._executeMethod = function(options, callback) {
    options = options || {};
    var self = this,
        method, body,
        serviceName = options.serviceName,
        portName = options.portName,
        methodName = options.methodName,
        outputName = options.outputName,
        args = options.args,
        style = options.style,
        handled = false;

    try {
        method = this.services[serviceName][portName][methodName];
    } catch(e) {
        return callback(this._envelope(''));
    }

    function handleResult(result) {
        if (handled) return;
        handled = true;

        if(style==='rpc') {
            body = self.wsdl.objectToRpcXML(outputName, result, '', self.wsdl.definitions.$targetNamespace);
        } else {
            var element = self.wsdl.definitions.services[serviceName].ports[portName].binding.methods[methodName].output;
            body = self.wsdl.objectToDocumentXML(outputName, result, element.targetNSAlias, element.targetNamespace);
        }
        callback(self._envelope(body));
    }

    /// XXX modif lib: forward request body
    var result = method(args, handleResult);
    if (typeof result !== 'undefined') {
        handleResult(result);
    }
}

/*
<SOAP-ENV:Envelope
xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
xmlns:ocppCs15="urn://Ocpp/Cp/2012/06/"
xmlns:wsa="http://www.w3.org/2005/08/addressing" >
<SOAP-ENV:Header>
  <wsa:Action>/ACTION</wsa:Action>
  <wsa:RelatesTo RelationshipType="http://www.w3.org/2005/08/addressing/reply">HRELMESSIDTO</wsa:RelatesTo>
  <wsa:To>HTO</wsa:To>
  <wsa:MessageID>HMESSID</wsa:MessageID>
</SOAP-ENV:Header>
*/

Server.prototype._envelope = function(body) {
    var defs = this.wsdl.definitions,
        ns = defs.$targetNamespace,
        encoding = '',
        alias = findKey(defs.xmlns, ns),
        // XXX modif lib: add chargeboxidentity header
        cbIdHeader = this.cbId ?
          "<tns:chargeBoxIdentity soap:mustUnderstand='true'>"+
            this.cbId +"</tns:chargeBoxIdentity>"
          : "",
        actionHeader = this.action ?
          "<wsa5:Action soap:mustUnderstand='true'>"+
            this.action +"</wsa5:Action>"
          : "",
        relatesTo = "<wsa5:RelatesTo RelationshipType='http://www.w3.org/2005/08/addressing/reply' soap:mustUnderstand='true'>"+
            this.messageId
            +"</wsa5:RelatesTo>";

    var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
            "<soap:Envelope xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\" " +
               encoding +
               this.wsdl.xmlnsInEnvelope + '>' +
               "<soap:Header>"+ cbIdHeader + actionHeader + relatesTo +"</soap:Header>" +
                "<soap:Body>" +
                    body +
                "</soap:Body>" +
            "</soap:Envelope>";
    return xml;
}

exports.Server = Server;
