


const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { join } = require('path');
const { readJsonFileSync } = require('@feathers-plus/test-utils');
const hookNedb2 = require('../../../../src1/services/nedb-2/hooks/hook.nedb2');

// Get generated fake data
// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync(join(__dirname, '../../../../seeds/fake-data.json')) || {};

describe('Test nedb-2/hooks/hook.nedb2.integ.test.js', () => {
  let app, params;
  // eslint-disable-next-line no-unused-vars
  let service;

  beforeEach(() => {
    app = feathers();

    app.use('/test-service', {
      async create(data) {
        return data;
      }
    });

    app.service('/test-service').hooks({
      before: {
        create: hookNedb2()
      }
    });

    service = app.service('/test-service');
    params = {
      user: (fakeData['users1'] || [])[0] || {
        email: 'test@example.com'
      }

    };
  });


  it('Hook exists', () => {
    assert(typeof hookNedb2 === 'function', 'Hook is not a function.');
  });

  it('???', async () => {
    params.provider = undefined;
    assert(true);

    /*
    const result = await service.create({

    }, params);

    assert.deepEqual(user, {

    }, result);
    */
  });
});
