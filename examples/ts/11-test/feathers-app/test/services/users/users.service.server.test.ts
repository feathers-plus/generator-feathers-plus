
/// <reference types="mocha"/>

import assert from 'assert';
import app from '../../../src/app';
import config from '../../../config/default.json';

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
const dbChangesAllowed = env.indexOf(process.env.NODE_ENV) !== -1;
if (!dbChangesAllowed) {
  // tslint:disable-next-line:no-console
  console.log('SKIPPED - Test users/users.service.server.test.ts');
  // @ts-ignore
  return;
}

describe('Test users/users.service.server.test.ts', () => {
  it('registered the service', () => {
    const service = app.service('/users');

    assert.ok(service, 'Registered the service');
  });

  it('???', async () => {
    // Setting `provider` indicates an external request
    // tslint:disable-next-line:no-unused-variable
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
