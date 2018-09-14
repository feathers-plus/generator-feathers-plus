


const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { join } = require('path');
const { readJsonFileSync } = require('@feathers-plus/test-utils');
const hookNedb12 = require('../../src1/hooks/hook.nedb12');

// Get generated fake data
// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync(join(__dirname, '../../seeds/fake-data.json')) || {};

describe('Test /hooks/hook.nedb12.integ.test.js', () => {
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
        create: hookNedb12()
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
    assert(typeof hookNedb12 === 'function', 'Hook is not a function.');
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
