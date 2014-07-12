var express = require('myexpress');

var app = express();
app.connect('/foo', function(req, resp, next) {
  resp.end('foo');
});
app.listen(4000);      
