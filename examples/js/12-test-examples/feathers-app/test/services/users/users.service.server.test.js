
const assert = require('assert');
const app = require('../../../src/app');
const config = require('../../../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV) || process.argv.includes('--noclient')) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test users/users.service.server.test.js');

  return;
}

describe('Test users/users.service.server.test.js', () => {
  beforeEach(async () => {
    await app.service('/users').remove(null);
  });

  it('registered the service', () => {
    const service = app.service('/users');

    assert.ok(service, 'Registered the service');
  });

  it('creates a user and encrypts the password ', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });

    // Makes sure the password got encrypted
    assert.ok(user.password !== 'secret');
  });

  it('removes password for external requests', async () => {
    // Setting `provider` indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: 'test2@example.com',
      password: 'secret'
    }, params);

    // Make sure password has been removed
    assert.ok(!user.password);
  });
});
