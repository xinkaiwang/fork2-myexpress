var http = require('http');
var Layer = require('./lib/layer');

module.exports = express;

function express() {
  var app = function(req, resp, next) {
    var step = 0;
    function _next(err) {
      if(app.stack.length > step) {
        var layer = app.stack[step++];
        var matched;
        if (matched = layer.match(req.url)) {
          req.params = matched.params;
          if(err && layer.iserrorhandle) {
            layer.handle(err, req, resp, _next);
          }
          else if(!err && !layer.iserrorhandle) {
            try {
              layer.handle(req, resp, _next);
            }catch(err) {
              _next(err);
            }
          }
          else {
            _next(err);
          }
        }
        else {
          _next(err);
        }
      }
      else {
        // when reach here, means non of our handlers want to handle this request.
        if (!next) { // when next not null, means we are currently running inside other express container, so we need pass it on.
          if (!err) {
            resp.statusCode = 404;
            resp.end();
          }
          else {
            resp.statusCode = 500;
            resp.end();
          }
        }
        else {
          next(err);
        }
      }
    }
    _next();
  };
  app.stack = [];
  app.listen = function(port, done) {
    var server = http.createServer(app);
    return server.listen(port, done);
  };
  app.use = function(path, handle) {
    if (typeof(arguments[0]) === 'function') {
      handle = path;
      path = "";
    }
    var layer = new Layer(path, handle);
    app.stack.push(layer);
  };
  return app;
}

