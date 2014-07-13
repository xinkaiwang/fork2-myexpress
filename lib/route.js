var methods = require('methods');

module.exports = makeRoute;

function makeRoute(verb, handler) {
  var route = function(req, res, next) {
    var step = 0;
    var _next = function(skiproute) {
      if(skiproute && skiproute === 'route') {
        next();
      }
      else if (skiproute) {
        next(skiproute);
      }
      else if(step < route.stack.length) {
        var item = route.stack[step++];
        if(item.verb === 'all' || item.verb.toUpperCase() === req.method.toUpperCase()) {
          item.handler(req, res, _next);
        }
        else {
          _next();
        }
      }
      else {
        // no more handlers in this route
        next();
      }
    };
    _next();
  };
  route.stack = []; // {verb, handler}
  // 'all(handler)'
  route.all = function(handler) {
    route.stack.push({'verb':'all', 'handler':handler});
    return route;
  };
  // all other verbs
  methods.forEach(function(verb) {
    route[verb] = function(handler) {
      route.stack.push({'verb':verb, 'handler':handler});
      return route;
    };
  });
  // 'use(handler)'
  route.use = function(verb, handler) {
    route[verb](handler);
  };
  if(verb && handler) {
    route.use(verb, handler);
  }
  return route;
}
