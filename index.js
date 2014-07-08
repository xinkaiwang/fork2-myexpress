var http = require('http');

module.exports = express;

// http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
    if(result === null)
      result = []
        return result
}

function express() {
  var stack = [];
  var app = function(req, resp, next) {
    var step = 0;
    function _next(err) {
      if(stack.length > step) {
        var handler = stack[step++];
        var handlerargs = getParamNames(handler);
        var iserrorhandler = handlerargs.length > 1 && /err/.test(handlerargs[0]);
        if(err && iserrorhandler) {
          handler(err, req, resp, _next);
        }
        else if(!err && !iserrorhandler) {
          try {
            handler(req, resp, _next);
          }catch(err) {
            _next(err);
          }
        }
        else {
          _next(err);
        }
      }
      else {
        // when reach here, means non of our handlers want to handle this request.
        if (!next) {
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
  }
  app.listen = function(port, done) {
    var server = http.createServer(app);
    return server.listen(port, done);
  };
  app.use = function(handler) {
    stack.push(handler);
  };
  return app;
}

