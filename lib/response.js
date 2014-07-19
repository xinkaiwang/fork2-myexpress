var http = require('http');
var mime = require('mime');
var accepts = require('accepts');
var _ = require('underscore');

var proto = {};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;
module.exports = proto;

function redirect(httpStatusCode, path) {
  if(!path && typeof(httpStatusCode) === 'string') {
    path = httpStatusCode;
    httpStatusCode = 302;
  }
  this.setHeader('Location', path);
  this.setHeader('Content-Length', 0);
  this.statusCode = httpStatusCode;
  this.end();
}

function type(extensionName) { // '.html', 'json', etc.
  var contentType = mime.lookup(extensionName);
  this.setHeader('Content-Type', contentType);
}

function default_type(extensionName) { // res.default_type(".html") sets the Content-Type to be text/html if it wasn't already set.
  if (!this.getHeader('Content-Type')) {
    var contentType = mime.lookup(extensionName);
    this.setHeader('Content-Type', contentType);
  }
}

function format(serailizer) {
  var supportedTypes = _.keys(serailizer);
  var accept = accepts(this.req); // this is a res
  renderType = accept.types(supportedTypes); // find a match for us
  if (renderType && _.isFunction(serailizer[renderType])) {
    this.type(renderType);
    serailizer[renderType]();
  } else {
    var err = new Error("Not Acceptable");
    err.statusCode = 406;
    throw err;
  }
}


proto.redirect = redirect;
proto.type = type;
proto.default_type = default_type;
proto.format = format;
