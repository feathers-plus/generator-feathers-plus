
const assert = require('assert');
const discard = require('../../src/hooks/discard');

describe('Test /hooks/discard.unit.test.js', () => {
  // eslint-disable-next-line no-unused-vars
  let contextBefore, contextAfterPaginated,
    // eslint-disable-next-line no-unused-vars
    contextAfter, contextAfterMultiple;

  beforeEach(() => {
    contextBefore = {

      type: 'before',
      params: { provider: 'socketio' },
      data: {
        first: 'John', last: 'Doe'
      }
    };

    contextAfter = {

      type: 'after',
      params: { provider: 'socketio' },
      result: {
        first: 'Jane', last: 'Doe'
      }
    };

    contextAfterMultiple = {

      type: 'after',
      params: { provider: 'socketio' },
      result: [
        { first: 'John', last: 'Doe' },
        { first: 'Jane', last: 'Doe' }
      ]
    };

    contextAfterPaginated = {

      type: 'after',
      method: 'find',
      params: { provider: 'socketio' },
      result: {
        data: [
          { first: 'John', last: 'Doe' },
          { first: 'Jane', last: 'Doe' }
        ]
      }
    };
    contextAfterPaginated.result.total = contextAfterPaginated.result.data.length;
  });

  it('Hook exists', () => {
    assert(typeof discard === 'function', 'Hook is not a function.');
  });

  describe('removes fields', () => {
    it('updates context before::create', () => {
      contextBefore.method = 'create'; //
      discard('first')(contextBefore);
      assert.deepEqual(contextBefore.data, { last: 'Doe' });
    });

    it('updates context after::find with pagination', () => {
      contextAfterPaginated.method = 'find';
      discard('last')(contextAfterPaginated);
      assert.deepEqual(contextAfterPaginated.result.data, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });

    it('updates context after::find with no pagination', () => {
      contextAfterMultiple.method = 'find';
      discard('last')(contextAfterMultiple);
      assert.deepEqual(contextAfterMultiple.result, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });

    it('updates context after', () => {
      contextAfter.method = 'update';
      discard('last')(contextAfter);
      assert.deepEqual(contextAfter.result, { first: 'Jane' });
    });

    it('updates when called internally on server', () => {
      contextAfter.method = 'create';
      contextAfter.params.provider = '';
      discard('last')(contextAfter);
      assert.deepEqual(contextAfter.result, { first: 'Jane' });
    });

    it('does not throw if field is missing', () => {
      contextBefore.method = 'update';
      discard('first', 'xx')(contextBefore);
      assert.deepEqual(contextBefore.data, { last: 'Doe' });
    });

    it('does not throw if field is null', () => {
      contextBefore.method = 'update';
      contextBefore.data = { first: null, last: 'Doe' };

      discard('first')(contextBefore);
      assert.deepEqual(contextBefore.data, { last: 'Doe' });
    });
  });

  describe('handles dot notation', () => {
    // We are not implementing these tests in this example
  });
});
