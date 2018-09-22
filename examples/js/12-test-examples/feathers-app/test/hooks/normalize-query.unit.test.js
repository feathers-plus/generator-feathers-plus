
const assert = require('assert');
const normalizeQuery = require('../../src/hooks/normalize-query');

describe('Test /hooks/normalize-query.unit.test.js', () => {
  // eslint-disable-next-line no-unused-vars
  let contextBefore, contextAfterPaginated,
    // eslint-disable-next-line no-unused-vars
    contextAfter, contextAfterMultiple;

  // Generated scaffolding
  beforeEach(() => {
    contextBefore = {
      type: 'before',
      params: { provider: 'socketio' },
      data: {

      }
    };

    contextAfter = {
      type: 'after',
      params: { provider: 'socketio' },
      result: {

      }
    };

    contextAfterMultiple = {
      type: 'after',
      params: { provider: 'socketio' },
      result: [

      ]
    };

    contextAfterPaginated = {
      type: 'after',
      method: 'find',
      params: { provider: 'socketio' },
      result: {
        data: [

        ]
      }
    };
    contextAfterPaginated.result.total =
      contextAfterPaginated.result.data.length;
  });

  it('Hook exists', () => {
    assert(typeof normalizeQuery === 'function', 'Hook is not a function.');
  });

  it('???', () => {
    contextBefore.method = 'create';
    assert(true);

    /*
    normalizeQuery()(contextBefore);

    assert.deepEqual(contextBefore.data, {

    });
    */
  });
});
