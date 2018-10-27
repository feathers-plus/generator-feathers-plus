
const assert = require('assert');
const { readJsonFileSync } = require('@feathers-plus/test-utils');
const app = require('../../../src1/app');
const config = require('../../../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV)) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test nedb-1/nedb-1.service.server.test.js');

  return;
}

// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync([__dirname, '../../../../seeds/fake-data.json']) || {};

describe('Test nedb-1/nedb-1.service.server.test.js', () => {
  beforeEach(async () => {
    await app.service('/nedb-1').remove(null);
  });

  it('registered the service', () => {
    const service = app.service('/nedb-1');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // eslint-disable-next-line no-unused-vars
    const params = { provider: 'socketio' };
    assert(true);

    /*
    const record = await app.service('/nedb-1').create({

    }, params);

    assert.deepEqual(record, {

    });
    */
  });
});
