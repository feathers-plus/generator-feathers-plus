
const assert = require('assert');
const app = require('../../../src1/app');
const config = require('../../../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV) || process.argv.includes('--noclient')) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test nedb-2/nedb-2.service.server.test.js');

  return;
}

describe('Test nedb-2/nedb-2.service.server.test.js', () => {
  beforeEach(async () => {
    await app.service('/nedb-2').remove(null);
  });

  it('registered the service', () => {
    const service = app.service('/nedb-2');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // eslint-disable-next-line no-unused-vars
    const params = { provider: 'socketio' };
    assert(true);

    /*
    const record = await app.service('/nedb-2').create({

    }, params);

    assert.deepEqual(record, {

    });
    */
  });
});
