var Layer = require('./lib/layer');

var l = new Layer("/foo", function() {});

var match = l.match('/oo/bar');

console.log(match);

