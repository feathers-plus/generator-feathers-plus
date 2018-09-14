


const assert = require('assert');
const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');
;
const { join } = require('path');
const { localStorage, readJsonFileSync } = require('@feathers-plus/test-utils');

const config = require('../../../config/default.json');

const delayAfterServerOnce = 500;
const delayAfterServerClose = 500;
const timeoutForStartingServerAndClient = 30000;
const timeoutForClosingingServerAndClient = 30000;

const email = 'login@example.com';
const password = 'login';

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
const dbChangesAllowed = env.indexOf(process.env.NODE_ENV) !== -1;
if (!dbChangesAllowed) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test nedb-1/nedb-1.service.client.test.js');

  return;
}

// Get generated fake data
// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync(join(__dirname, '../../../seeds/fake-data.json')) || {};

describe('Test nedb-1/nedb-1.service.client.test.js', () => {
  let app;
  let client;
  let server;

  before(async function () {
    this.timeout(timeoutForStartingServerAndClient);

    // Restarting src/app.*s is required if a previous server make a service call
    // using the REST transport and we want to make one using a WebSocket transport.
    delete require.cache[require.resolve('../../../src1/app')];
    app = require('../../../src1/app');

    const host = app.get('host');
    const port = app.get('port');

    const result = await app.service('/nedb-1').find({ query: { email }});
    if ((result.data || result).length === 0) {
      await app.service('/nedb-1').create({ email, password });
    }

    server = app.listen(port);
    return await new Promise(resolve => {
      server.once('listening', () => {
        setTimeout(async () => {
          client = await makeClient(host, port, email, password);
          resolve();
        }, delayAfterServerOnce);
      });
    });
  });

  after(function (done) {
    this.timeout(timeoutForClosingingServerAndClient);
    client.logout();
    server.close();
    setTimeout(() => done(), delayAfterServerClose);
  });

  it('registered the service', () => {
    const service = client.service('/nedb-1');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // eslint-disable-next-line no-unused-vars
    const params = { provider: 'socketio' };
    assert(true);

    /*
    const record = await client.service('/nedb-1').create({

    }, params);

    assert.deepEqual(record, {

    });
    */
  });
});

async function makeClient(host, port, email1, password1) {
  const client = feathersClient();
  const socket = io(`http://${host}:${port}`, {
    transports: ['websocket'], forceNew: true, reconnection: false, extraHeaders: {}
  });
  client.configure(feathersClient.socketio(socket));
  client.configure(feathersClient.authentication({
    storage: localStorage
  }));

  try {
    await client.authenticate({
      strategy: 'local',
      email: email1,
      password: password1,
    });
  } catch (err) {
    throw new Error(`Unable to authenticate: ${err.message}`);
  }

  return client;
}
