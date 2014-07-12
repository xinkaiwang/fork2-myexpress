var Layer = require('./lib/layer');

var l = new Layer("/foo/:a/:b", function() {});

var match = l.match('/foo/bar/xiaomi');

console.log(match);

