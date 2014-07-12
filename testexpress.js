var app = require('express')();

app.use(function(req, resp, next) {
  next();
});

app.use(function(req, resp, next) {
  resp.end("hello from the second middleware");
});

app.listen(4000);
