const assert = require('assert');
const app = require('../../../../src1/app');

describe('\'nedb4\' service', () => {
  it('registered the service', () => {
    const service = app.service('nedb-4');

    assert.ok(service, 'Registered the service');
  });
});
