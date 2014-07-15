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

function arraysEqual(arr1, arr2) { // internal use only
  if (arr1 === arr2) return true;
  if (arr1 === null || arr2 === null) return false;
  if (arr1.length != arr2.length) return false;

  for (var i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
function needInject(parameters) { // internal use only
  var skipRules = [
    [],
    ['req'],
    ['req', 'res'],
    ['req', 'res', 'next'],
    ['err', 'req', 'res', 'next'],
    ['error', 'req', 'res', 'next']
  ];
  for (var i = 0; i < skipRules.length; ++i) {
    if (arraysEqual(skipRules[i], parameters)) {
      return false;
    }
  }
  return true;
}

function createInjector(handler, app) {  
  var parameters = createInjector.getParameters(handler);
  if (handler && !needInject(parameters)) {
    handler.extract_params = function() { // this is for fixing test case "Handler Dependencies Analysis: extracts the parameter names:"
      return createInjector.getParameters(handler);
    }
    return handler;
  }
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
    if(req && !req.di_cache) req.di_cache = {};
    function resolveValue(name, callback) { // callback(err, value)
      if(name === 'req') {
        callback(null, req);
      } else if(name == 'res') {
        callback(null, res);
      } else if(name == 'next') {
        callback(null, next);
      } else if(req && req.di_cache && req.di_cache.hasOwnProperty(name)) {
        callback(null, req.di_cache[name]);
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

