var http = require('http');

module.exports = express;

function express() {
  var app = function(req, resp) {
    resp.statusCode = 404;
    resp.end();
  }
  app.listen = function(port, done) {
    var server = http.createServer(app);
    return server.listen(port, done);
  };
  return app;
}

