'use strict';
var common = require('../common');
var assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
var tls = require('tls');

var fs = require('fs');


var received = '';
var ended = 0;

var server = tls.createServer({
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
}, function(c) {
  c._write('hello ', null, function() {
    c._write('world!', null, function() {
      c.destroy();
    });
    c._write(' gosh', null, function() {});
  });

  server.close();
}).listen(0, function() {
  var c = tls.connect(this.address().port, {
    rejectUnauthorized: false
  }, function() {
    c.on('data', function(chunk) {
      received += chunk;
    });
    c.on('end', function() {
      ended++;
    });
  });
});

process.on('exit', function() {
  assert.equal(ended, 1);
  assert.equal(received, 'hello world! gosh');
});
