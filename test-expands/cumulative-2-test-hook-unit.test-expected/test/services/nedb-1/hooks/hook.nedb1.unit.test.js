



const assert = require('assert');
const hookNedb1 = require('../../../../src1/services/nedb-1/hooks/hook.nedb1');

describe('Test nedb-1/hooks/hook.nedb1.unit.test.js', () => {
  let contextBefore, contextAfterPaginated,
    // eslint-disable-next-line no-unused-vars
    contextAfter, contextAfterMultiple;

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
      } };
    contextAfterPaginated.result.total = contextAfterPaginated.result.data.length;
  });

  it('Hook exists', () => {
    assert(typeof hookNedb1 === 'function', 'Hook is not a function.');
  });

  it('???', () => {
    contextBefore.method = 'create';
    assert(true);

    /*
    hookNedb1()(contextBefore);

    assert.deepEqual(contextBefore.data, {

    });
    */
  });
});
