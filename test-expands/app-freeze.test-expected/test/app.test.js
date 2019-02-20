
const assert = require('assert');
const rp = require('request-promise');
const url = require('url');
const app = require('../src1/app');

const port = app.get('port') || 3030;
const getUrl = pathname => url.format({
  hostname: app.get('host') || 'localhost',
  protocol: 'http',
  port,
  pathname
});

describe('Feathers application tests', () => {
  let server;

  before(function (done) {
    server = app.listen(port);
    server.once('listening', () => {
      setTimeout(() => done(), 500);
    });
  });

  after(function (done) {
    server.close();
    setTimeout(() => done(), 500);
  });

  it('starts and shows the index page', () => {
    return rp(getUrl()).then(body =>
      assert.ok(body.indexOf('<html>') !== -1, 'response does not contain <html>')
    );
  });

  describe('404', function () {
    it('shows a 404 HTML page', () => {
      return rp({
        url: getUrl('path/to/nowhere'),
        headers: {
          Accept: 'text/html'
        }
      }).catch(res => {
        assert.strictEqual(res.statusCode, 404, 'unexpected statusCode');
        assert.ok(res.error.indexOf('<html>') !== -1, 'error does not contain <html>');
      });
    });

    it('shows a 404 JSON error without stack trace', () => {
      return rp({
        url: getUrl('path/to/nowhere'),
        json: true
      }).catch(res => {
        assert.strictEqual(res.statusCode, 404, 'unexpected statusCode');
        assert.strictEqual(res.error.code, 404, 'unexpected error.code');
        assert.strictEqual(res.error.message, 'Page not found', 'unexpected error.message');
        assert.strictEqual(res.error.name, 'NotFound', 'unexpected error.name');
      });
    });
  });
});
