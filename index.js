var http = require('http');
var Layer = require('./lib/layer');
var makeRoute = require('./lib/route');
var injector = require('./lib/injector');
var _ = require('underscore');

module.exports = express;

function express() {
  var app = function(req, res, next) {
    app.monkey_patch(req, res);
    app.handle(req, res, next);
  };
  app.handle = function(req, resp, next) {
    var parentApp = req.app;
    req.app = app;
    var step = 0;
    var originalurl = req.url; // we want to keep a copy of this becuase we are going to modify it.
    function _next(err) {
      if(app.stack.length > step) {
        var layer = app.stack[step++];
        var matched;
        if (matched = layer.match(originalurl)) {
          req.params = matched.params;
          if(err && layer.iserrorhandle) {
            layer.handle(err, req, resp, _next);
          }
          else if(!err && !layer.iserrorhandle) {
            try {
              if (typeof layer.handle.handle === 'function') {
                var subpath = originalurl.substring(matched.path.length, originalurl.length);
                if (subpath.length === 0) subpath = '/';
                req.url = subpath;
              }
              else {
                req.url = originalurl;
              }
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
          req.app = parentApp; // restore req.app to parent app before we quit
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
  //app.get = function(path, handle) {
  //  if (typeof(arguments[0]) === 'function') {
  //    handle = path;
  //    path = "";
  //  }
  //  var layer = new Layer(path, makeRoute('GET', handle), true);
  //  app.stack.push(layer);
  //};
  var methods = require('methods').concat("all");
  _.each(methods, function(verb) {
    app[verb] = function(path, handle) {
      if (typeof(arguments[0]) === 'function') {
        handle = path;
        path = "";
      }
      var layer = new Layer(path, makeRoute(verb, handle), true);
      app.stack.push(layer);
      return app;
    };
  });
  // app.route('/foo')
  app.route = function(path) {
    var r = route();
    app.use(r);
    return r;
  };

  // express-di
  app._factories = {};
  app.factory = function(name, fn) {
    app._factories[name] = fn;
  };
  app.inject= function(fn) {
    return injector(fn, app);
  }

  var prototypeForReq;
  var protptypeForRes;
  app.monkey_patch = function(req, res) {
    req.res = res;
    res.req = req;
    if(!req.isExpress) {
      req.__proto__ = require('./lib/request');
    }
    if(!res.isExpress) {
      res.__proto__ = require('./lib/response');
    }
  }
  return app;
}

