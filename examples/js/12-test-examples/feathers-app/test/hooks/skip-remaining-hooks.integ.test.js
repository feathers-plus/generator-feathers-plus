
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const skipRemainingHooks = require('../../src/hooks/skip-remaining-hooks');

describe('Test /hooks/skip-remaining-hooks.integ.test.js', () => {
  let app;
  // eslint-disable-next-line no-unused-vars
  let service;
  let hooksRun;

  function setHookRun( name) {
    return () => {
      hooksRun.push(name);
    };
  }

  beforeEach(() => {
    app = feathers();
    hooksRun = [];

    app.use('/test-service', {
      async create(data) {
        return data;
      }
    });

    app.service('/test-service').hooks({
      before: {
        create: [
          setHookRun('before1'),
          skipRemainingHooks(true),
          setHookRun('before2')
        ]
      },
      after: {
        create: [
          setHookRun('after1'),
          skipRemainingHooks(true),
          setHookRun('after2')
        ]
      }
    });

    service = app.service('/test-service');
    params = {
      user: {
        email: 'test@example.com'
      }

    };
  });


  it('Hook exists', () => {
    assert(typeof skipRemainingHooks === 'function', 'Hook is not a function.');
  });

  it('SKIP before skips following before hooks', async () => {
    const result = await service.create({
      foo: 'bar'
    }, params);
    assert(!hooksRun.includes('before2'), 'following hooks are run');
  });

  it('SKIP before does not skip after hooks', async () => {
    await service.create({ foo: 'bar' });
    assert.deepEqual(hooksRun, ['before1', 'after1']);
  });
});
