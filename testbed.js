// the module is a factory function that builds an express app
var express = require("myexpress");

// factory function returns an express app
var app = express();

// start the http server
var http = require("http");
var server = http.createServer(app);
server.listen(4000);
