const assert = require('assert');
const app = require('../../src/app');

describe('\'graphql\' service', () => {
  it('registered the service', () => {
    const service = app.service('graphql');

    assert.ok(service, 'Registered the service');
  });
});
