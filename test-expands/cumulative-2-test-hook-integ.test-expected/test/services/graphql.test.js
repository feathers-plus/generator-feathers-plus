const assert = require('assert');
const app = require('../../src1/app');

describe('\'graphql\' service', () => {
  it('registered the service', () => {
    const service = app.service('graphql');

    assert.ok(service, 'Registered the service');
  });
});
