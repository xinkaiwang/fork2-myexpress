var http = require('http');
var mime = require('mime');
var accepts = require('accepts');
var crc32 = require('buffer-crc32');
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

// res.send(new Buffer('whoop'));
// res.send({ some: 'json' });
// res.send('some html');
// res.send(404, 'Sorry, we cannot find that!');
// res.send(500, { error: 'something blew up' });
// res.send(200);
function send(data) {
  var statusCode = 200;
  if (typeof(data) === 'number') {
    statusCode = arguments[0];
    data = arguments[1];
  }

  var handled = false;
  if (data) {
    var type = typeof(data);
    if (type === 'object' && data.__proto__ === Buffer.prototype) { // Buffer()
      this.default_type('oct');
      this.setHeader('Content-Length', data.length);
      this.statusCode = statusCode;
      this.write(data);
      this.end();
      handled = true;
    } else if(type === 'string') { // 'string' as html
      this.default_type('html');
      var len = data.length;
      var buf = new Buffer(data, 'utf-8');
      if (this.req.method === 'GET') {
        if (!this.getHeader('ETag')) {
          var etag = crc32.unsigned(buf);
          this.setHeader('ETag', '"' + etag + '"');
        }
        var etag = this.getHeader('ETag');
        var ifNoneMatch = this.req.headers['if-none-match'];
        var ifModifiedSince = this.req.headers['if-modified-since'];
        var lastModified = this.getHeader('Last-Modified');
        if (etag === ifNoneMatch) {
          this.setHeader('Content-Length', 0);
          this.statusCode = 304; // not modified
          this.end();
          handled = true;
        } else if (lastModified && ifModifiedSince && new Date(lastModified) <= new Date(ifModifiedSince)) {
          this.setHeader('Content-Length', 0);
          this.statusCode = 304; // not modified
          this.end();
          handled = true;
        }
      }
      if (!handled) {
        this.setHeader('Content-Length', buf.length);
        this.statusCode = statusCode;
        this.write(buf);
        this.end();
        handled = true;
      }
    } else {
      var str = JSON.stringify(data);
      var buf = new Buffer(str, 'utf-8');
      this.type('json');
      this.setHeader('Content-Length', buf.length);
      this.statusCode = statusCode;
      this.write(buf);
      this.end();
      handled = true;
    }
  }
  if (!handled) {
    this.statusCode = statusCode;
    this.end(http.STATUS_CODES[statusCode.toString()]);
  }
}

proto.redirect = redirect;
proto.type = type;
proto.default_type = default_type;
proto.format = format;
proto.send = send;
