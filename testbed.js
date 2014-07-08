// the module is a factory function that builds an express app
var express = require("myexpress");

// factory function returns an express app
var app = express();
var m1 = function(req,res,next) {
  next();
}

var e1 = function(err,req,res,next) {
  // timeout
}

var m2 = function(req,res,next) {
  res.end("m2");
}
app.use(m1);
app.use(e1); // should skip this. will timeout if called.
app.use(m2);

// start the http server
var http = require("http");
var server = http.createServer(app);
server.listen(4000);
