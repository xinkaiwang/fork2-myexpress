var methods = require('methods');

module.exports = makeRoute;

function makeRoute(verb, handler) {
  var route = function(req, res, next) {
    var step = 0;
    var _next = function(skiproute) {
      if(step < route.stack.length && !(skiproute==='route')) {
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
  };
  // all other verbs
  methods.forEach(function(verb) {
    route[verb] = function(handler) {
      route.stack.push({'verb':verb, 'handler':handler});
    };
  });
  // 'use(handler)'
  route.use = function(verb, handler) {
    route[verb](handler);
  };
  return route;
}
