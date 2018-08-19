const assert = require('assert');
const app = require('../../src1/app');

describe('\'users1\' service', () => {
  it('registered the service', () => {
    const service = app.service('users-abc');

    assert.ok(service, 'Registered the service');
  });
});
