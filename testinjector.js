var injector = require('./lib/injector');

var ret = injector(function(req, res){}, null);
var args = ret.extract_params();
console.log(args);

