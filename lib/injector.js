var express_di = require('express-di');
var _ = require('underscore');

module.exports = createInjector;

// https://github.com/luin/express-di/blob/a94e70813d34a6ec0def450a47530a999774aadb/lib/utils.js#L30-L53
createInjector.getParameters = function (fn) {
  var fnText = fn.toString();
  if (createInjector.getParameters.cache[fnText]) {
    return createInjector.getParameters.cache[fnText];
  }

  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
      FN_ARG_SPLIT = /,/,
      FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
      STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

  var inject = [];
  var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);
  argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
      arg.replace(FN_ARG, function(all, underscore, name) {
        inject.push(name);
        });
      });

  createInjector.getParameters.cache[fn] = inject;
  return inject;
};

createInjector.getParameters.cache = {};

function createInjector(handler, app) {
  var injector = function(req, res, next) {
    var loader = injector.dependencies_loader(req, res, next);
    loader(function(err, values) {
      if(err) {
        next(err);
      } else {
        handler.apply(null, values);
      }
    });
  };
  injector.extract_params = function() {
    return createInjector.getParameters(handler);
  };
  // dependencies_loader()
  injector.dependencies_loader = function(req, res, next) {
    function resolveValue(name, callback) { // callback(err, value)
      if(name === 'req') {
        callback(null, req);
      } else if(name == 'res') {
        callback(null, res);
      } else if(name == 'next') {
        callback(null, next);
      } else if(app._factories[name]) {
        try {
          app._factories[name](req, res, callback);
        } catch(e) {
          callback(e);
        }
      } else {
          callback(new Error('Factory not defined: '+name));
      }
    }
    var loader = function(callback) { // callback(err, values)
      var argNames = injector.extract_params();
      var values = [];
      var step = 0;
      function _next(err, value) {
        if(err) {
          callback(err, null);
          return;
        }
        if(step > 0) {
          values.push(value);
        }
        if(step < argNames.length) {
          var name = argNames[step];
          step++;
          resolveValue(name, _next);
        } else {
          // now values is the fully resolved parameters
          callback(null, values);
        }
      }
      _next();
    }
    return loader;
  };
  return injector;
}

