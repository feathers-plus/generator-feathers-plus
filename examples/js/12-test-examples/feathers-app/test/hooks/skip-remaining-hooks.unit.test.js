
const assert = require('assert');
const SKIP = require('@feathersjs/feathers').SKIP;
const skipRemainingHooks = require('../../src/hooks/skip-remaining-hooks');

describe('Test /hooks/skip-remaining-hooks.unit.test.js', () => {
  let contextBefore, contextAfter;

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
  });

  it('Hook exists', () => {
    assert(typeof skipRemainingHooks === 'function', 'Hook is not a function.');
  });

  describe('Predicate is not a function', () => {
    it('False returns context', () => {
      const result = skipRemainingHooks(false)(contextBefore);
      assert.equal(result, contextBefore);
    });

    it('True returns SKIP token', () => {
      const result = skipRemainingHooks(true)(contextBefore);
      assert.equal(result, SKIP);
    });
  });

  describe('Predicate is a function', () => {
    it('False returns context', () => {
      const result = skipRemainingHooks(() => false)(contextBefore);
      assert.equal(result, contextBefore);
    });

    it('True returns SKIP token', () => {
      const result = skipRemainingHooks(() => true)(contextBefore);
      assert.equal(result, SKIP);
    });
  });

  describe('Default predicate is "context => !!context.result"', () => {
    it('No context.result', () => {
      const result = skipRemainingHooks()(contextBefore);
      assert.equal(result, contextBefore);
    });

    it('Has context.result', () => {
      const result = skipRemainingHooks()(contextAfter);
      assert.equal(result, SKIP);
    });
  });
});


