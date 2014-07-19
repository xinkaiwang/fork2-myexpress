var http = require('http');

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

proto.redirect = redirect;