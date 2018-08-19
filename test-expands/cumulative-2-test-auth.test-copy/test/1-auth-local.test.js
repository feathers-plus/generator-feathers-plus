
// THIS TEST MUST RUN BEFORE app.test.js

const assert = require('assert');
const httpShutdown = require('http-shutdown');
const url = require('url');
const app = require('../src1/app');

const { localStorage, loginLocal, makeClient } = require('../test-utils');

// !code: config
const testTimeout = 30000;
const usersServicePath = 'users-abc';
// Should server auth use option { allUnauthenticated: true }
const allowUnauthenticatedServiceName = null;

const loginEmail = 'john@gmail.com';
const loginPassword = 'john';

const hostname = 'localhost';
const port = app.get('port') || 3030;
const ioOptions = {
  transports: ['websocket'],
  forceNew: true,
  reconnection: false,
  extraHeaders: {},
};
const getUrl = pathname => url.format({
  hostname: hostname || app.get('host') || 'localhost',
  protocol: 'http',
  port,
  pathname
});
const transports = ['socketio', 'rest'];
// !end

describe('Feathers local authentication', () => {
  transports.forEach(transport => {
    describe(`transport ${transport}`, () => {
      let server;

      before(function (done) {
        server = app.listen(port);
        server = httpShutdown(server); // add better shutdown functionality
        server.once('listening', done);

        localStorage.clear();
      });

      after(function (done) {
        server.shutdown(done);
      });

      it('can authenticate', async function () {
        this.timeout(testTimeout);

        const appClient = makeClient({ transport, url: getUrl(), ioOptions });
        await loginLocal(appClient, loginEmail, loginPassword);
        const jwt = localStorage.getItem('feathers-jwt');

        assert(typeof jwt === 'string', 'jwt not a string');
        assert(jwt.length > 100, 'jwt too short');
      });

      it(`can make authenticated call on ${usersServicePath} service`, async function () {
        this.timeout(testTimeout);

        const appClient = makeClient({ transport, url: getUrl(), ioOptions });
        const usersClient = appClient.service(usersServicePath);

        await loginLocal(appClient, loginEmail, loginPassword);

        const result = await usersClient.find({ query: { email: loginEmail }});
        const rec = result.data[0] || result;

        assert.equal(rec.email, loginEmail, 'wrong email');
      });

      if (allowUnauthenticatedServiceName) {
        it(`can make unauthenticated call on ${allowUnauthenticatedServiceName} service`, async function () {
          this.timeout(testTimeout);

          const appClient = makeClient({ transport, url: getUrl(), ioOptions });
          const allowClient = appClient.service(allowUnauthenticatedServiceName);

          await allowClient.find();
        });
      }

      it('throws on incorrect email', async function () {
        this.timeout(testTimeout);

        const appClient = makeClient({ transport, url: getUrl(), ioOptions });

        try {
          // eslint-disable-next-line no-console
          console.log('..Expect error to be logged below:');
          await loginLocal(appClient, '#$%^&*()', '$%^&*()');

          assert(false, 'login unexpectedly succeeded');
        } catch (err) {
          assert(true);
        }
      });

      it('throws on incorrect password', async function () {
        this.timeout(testTimeout);

        const appClient = makeClient({ transport, url: getUrl(), ioOptions });

        try {
          // eslint-disable-next-line no-console
          console.log('..Expect error to be logged below:');
          await loginLocal(appClient, loginEmail, '$%^&*()');

          assert(false, 'login unexpectedly succeeded');
        } catch (err) {
          assert(true);
        }
      });

      it('throws on call before authentication', async function () {
        this.timeout(testTimeout);

        const appClient = makeClient({ transport, url: getUrl(), ioOptions });
        const usersClient = appClient.service(usersServicePath);

        try {
          // eslint-disable-next-line no-console
          console.log('..Expect error to be logged below:');
          await usersClient.find({ query: { email: loginEmail }});

          assert(false, 'call unexpectedly succeeded');
        } catch (err) {
          assert(true);
        }
      });
    });
  });
});
