
/// <reference types="mocha"/>
import assert from 'assert';
import { readJsonFileSync } from '@feathers-plus/test-utils';
import app from '../../../src1/app';
import config from '../../../config/default.json';

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV)) {
  // tslint:disable-next-line:no-console
  console.log('SKIPPED - Test nedb-2/nedb-2.service.server.test.ts');
  // @ts-ignore
  return;
}

// tslint:disable-next-line:no-unused-variable
const fakeData = readJsonFileSync([__dirname, '../../../../seeds/fake-data.json']) || {};

describe('Test nedb-2/nedb-2.service.server.test.ts', () => {
  beforeEach(async () => {
    await app.service('/nedb-2').remove(null);
  });

  it('registered the service', () => {
    const service = app.service('/nedb-2');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // tslint:disable-next-line:no-unused-variable
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
