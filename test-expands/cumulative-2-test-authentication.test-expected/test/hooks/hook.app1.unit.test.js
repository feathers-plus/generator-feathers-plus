



const assert = require('assert');
const hookApp1 = require('../../src1/hooks/hook.app1');

describe('Test /hooks/hook.app1.unit.test.js', () => {
  // eslint-disable-next-line no-unused-vars
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
    assert(typeof hookApp1 === 'function', 'Hook is not a function.');
  });

  it('???', () => {
    contextBefore.method = 'create';
    assert(true);

    /*
    hookApp1()(contextBefore);

    assert.deepEqual(contextBefore.data, {

    });
    */
  });
});
