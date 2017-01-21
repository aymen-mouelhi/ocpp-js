
/**
 *  HTTPServerWrapper
 *
 */

var HTTPServerWrapper = function() {
  this.httpServer = null;

  this.create();
};

HTTPServerWrapper.prototype = {

  create: function() {
    this.httpServer = http.createServer(function(request, response) {
      Utils.log("Received request for " + request.url, "cs");
      response.writeHead(404);
      response.end();
    });
  },

  listen: function(port, func) {
    this.httpServer.listen(port, func);
  }

};
