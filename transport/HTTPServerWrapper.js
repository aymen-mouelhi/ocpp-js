const Utils = require('../utils/utils.js');
const http = require("http");

class HTTPServerWrapper {
  constructor() {
    this.httpServer = null;
    this.create();
  }

  create() {
    this.httpServer = http.createServer(function(request, response) {
      console.log("Received request for " + request.url, "cs");
      response.writeHead(404);
      response.end();
    });
  }

  listen(port, func) {
    this.httpServer.listen(port, func);
  }
}

module.exports = HTTPServerWrapper;
