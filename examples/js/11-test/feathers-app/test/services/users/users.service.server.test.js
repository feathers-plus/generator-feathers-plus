


const assert = require('assert');
const app = require('../../../src/app');
const config = require('../../../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
const dbChangesAllowed = env.indexOf(process.env.NODE_ENV) !== -1;
if (!dbChangesAllowed) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test users/users.service.server.test.js');

  return;
}

describe('Test users/users.service.server.test.js', () => {
  it('registered the service', () => {
    const service = app.service('/users');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // eslint-disable-next-line no-unused-vars
    const params = { provider: 'socketio' };
    assert(true);

    /*
    const record = await app.service('/users').create({

    }, params);

    assert.deepEqual(record, {

    });
    */
  });
});
