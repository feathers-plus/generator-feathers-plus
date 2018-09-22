
/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../../src1/app';
import config from '../../../config/default.json';

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV) || process.argv.includes('--noclient')) {
  // tslint:disable-next-line:no-console
  console.log('SKIPPED - Test nedb-1/nedb-1.service.server.test.ts');
  // @ts-ignore
  return;
}

describe('Test nedb-1/nedb-1.service.server.test.ts', () => {
  beforeEach(async () => {
    await app.service('/nedb-1').remove(null);
  });

  it('registered the service', () => {
    const service = app.service('/nedb-1');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // tslint:disable-next-line:no-unused-variable
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
