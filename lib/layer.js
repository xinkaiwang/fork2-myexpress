
module.exports = Layer;

var proto = {};
proto.match = function(urlpath) {
  if(!this.bindtopath) {
    return {path:null};
  }
  else if (urlpath.startsWith(this.bindtopath)) {
    return {path:this.bindtopath};
  }
  else {
    return undefined;
  }
};

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

function Layer(path, handle) {
  this.bindtopath = path;
  this.handle = handle;
  var handleargs = getParamNames(handle);
  this.iserrorhandle = handleargs.length > 1 && /err/.test(handleargs[0]);
};

// http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

Layer.prototype = proto;

