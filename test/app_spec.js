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
        .set('Accept', 'application/json')
        //.expect('Content-Type', /json/)
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

describe("app",function() {
  // ... previous tests
});

