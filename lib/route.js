
module.exports = makeRoute;

function makeRoute(verb, handler) {
  var VERB = verb.toUpperCase();
  return function(req, res, next) {
    if(VERB === req.method.toUpperCase()) {
      handler(req, res, next);
    }
    else {
      next();
    }
  };
}
