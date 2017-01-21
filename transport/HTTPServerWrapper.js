const Utils = require('../utils/utils.js');

class HTTPServerWrapper {
  constructor() {
    this.httpServer = null;
    this.create();
  }

  create() {
    this.httpServer = http.createServer(function(request, response) {
      Utils.log("Received request for " + request.url, "cs");
      response.writeHead(404);
      response.end();
    });
  }

  listen(port, func) {
    this.httpServer.listen(port, func);
  }
}
