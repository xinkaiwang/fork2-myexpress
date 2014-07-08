var myexpress = require("myexpress");
var request = require('supertest');

describe('myexpress', function() {
    it('myexpress not null', function() {
      var app = myexpress();
      expect(app).to.be.a('function');
      });
    });

describe('app', function() {
    describe('create http server', function() {
      it('responds to /foo with 404', function(done) {
        var app = myexpress();
        request(app)
        .get('/user')
        .expect(404, done);
        });
      });

    describe("#listen",function() {
      it('listen to 4000', function() {
        var app = myexpress();
        var ret = app.listen(4000);
        expect(ret).to.be.a('object');
        });
      });
    });

describe(".use",function() {
    it('single call', function() {
      var app = myexpress();
      var ret = app.use(function() {
        console.log("middle 1"); 
        });
      });
    it('multiple calls', function() {
      var app = myexpress();
      var ret = app.use(function() {
        console.log("middle 1"); 
        });
      var ret = app.use(function() {
        console.log("middle 2"); 
        });
      });
    });

describe("calling middleware stask", function() {
    var app;
    beforeEach(function() {
      app = new myexpress();
      });
    it('0 call', function(done) {
      request(app)
      .get('/user')
      .expect(404, done);
      });
    it('single call', function(done) {
      var m1 = function(req, resp, next) {
      resp.end("hello world");
      };
      app.use(m1);
      request(app)
      .get('/user')
      .expect(200, done);
      });
    it('multiple call', function(done) {
      var m1 = function(req, resp, next) {
      next();
      };
      var m2 = function(req, resp, next) {
      resp.end("hello world");
      };
      app.use(m1);
      app.use(m2);
      request(app)
      .get('/user')
      .expect(200, done);
      });
    it('multiple call', function(done) {
        var m1 = function(req, resp, next) {
        next();
        };
        var m2 = function(req, resp, next) {
        next();
        };
        app.use(m1);
        app.use(m2);
        request(app)
        .get('/user')
        .expect(404, done);
        });
});

describe("error handling", function() {
    var app;
    beforeEach(function() {
      app = new myexpress();
      });

    it('next a error', function(done) {
      var m1 = function(req, resp, next) {
      next(new Error("boom!"));
      }
      app.use(m1);
      request(app)
      .get('/user')
      .expect(500,done);
      });
    it('Throw error', function(done) {
      var m1 = function(req, resp, next) {
      throw new Error("boom!");
      }
      app.use(m1);
      request(app)
      .get('/user')
      .expect(500,done);
      });
    it('skip error handler', function(done) {
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

        request(app)
        .get('/user')
        .expect(200,done);
        });
    it('skip normal handler when error happend', function(done) {
        var m1 = function(req,res,next) {
        next(new Error("boom!"));
        }

        var e1 = function(err,req,res,next) {
        res.end("e1");
        }

        var m2 = function(req,res,next) {
        // timeout
        }
        app.use(m1);
        app.use(m2); // should skip this
        app.use(e1);

        request(app)
        .get('/user')
        .expect('e1')
        .end(done);
        });
});

describe("App Embeding As Middleware", function() {
    var app;
    beforeEach(function() {
      app = new myexpress();
      });
    it("pass unhandled request to parent", function(done) {
      subApp = new myexpress();

      function m2(req,res,next) {
      res.end("m2");
      }

      app.use(subApp);
      app.use(m2);

      request(app)
      .get('/user')
      .expect('m2')
      .end(done);
      });
    it("pass unhandled error to parent", function(done) {
      subApp = new myexpress();

      function m1(req,res,next) {
        next("m1 error");
      }

      function e1(err, req, res, next) {
        res.end(err);
      }
      app.use(subApp);
      subApp.use(m1);
      app.use(e1);

      request(app)
      .get('/user')
      .expect('m1 error')
      .end(done);
      });
});
