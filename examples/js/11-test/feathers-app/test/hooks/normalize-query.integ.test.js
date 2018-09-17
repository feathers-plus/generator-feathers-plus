


const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { join } = require('path');
const { readJsonFileSync } = require('@feathers-plus/test-utils');
const normalizeQuery = require('../../src/hooks/normalize-query');

// Get generated fake data
// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync(join(__dirname, '../../seeds/fake-data.json')) || {};

describe('Test /hooks/normalize-query.integ.test.js', () => {
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
        create: normalizeQuery()
      }
    });

    service = app.service('/test-service');
    params = {
      user: (fakeData['users'] || [])[0] || {
        email: 'test@example.com'
      }

    };
  });


  it('Hook exists', () => {
    assert(typeof normalizeQuery === 'function', 'Hook is not a function.');
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
