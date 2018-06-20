const assert = require('assert');
const app = require('../../../../src/app');

describe('\'name/space/nedb2\' service', () => {
  it('registered the service', () => {
    const service = app.service('nedb-2');

    assert.ok(service, 'Registered the service');
  });
});
