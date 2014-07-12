var p2re = require('path-to-regexp');

module.exports = Layer;

var proto = {};
proto.match = function(urlpath) {
  if(!this.bindtopath) {
    return {path:null, params:{}};
  }
  else if (this.re.test(urlpath)) {
    urlpath = decodeURIComponent(urlpath);
    var exec = this.re.exec(urlpath);
    var ret = {path:exec[0], params:{}};
    var len = this.names.length;
    for (var i =0;i < len; i++) {
      var name = this.names[i].name;
      ret.params[name] = exec[i+1];
    }
    return ret;
  }
  else {
    return undefined;
  }
};

// http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  if(!func) return [];
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
    result = [];
  return result;
}

function Layer(path, handle, end) {
  this.bindtopath = path;
  if (path) {
    this.names = [];
    this.re = p2re(path, this.names, {'end':(end?true:false)});
  }
  this.handle = handle;
  var handleargs = getParamNames(handle);
  this.iserrorhandle = handleargs.length > 1 && /err/.test(handleargs[0]);
}

// http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

Layer.prototype = proto;
