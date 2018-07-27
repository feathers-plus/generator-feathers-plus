
const { assert } = require('chai');

const stringify = require('../lib/stringify-plus');

describe('stringify-plus', () => {
  it('handles non-variable prop name', () => {
    const str = stringify(
      { '^[a-zA-Z_][a-zA-Z0-9_]*$': { type: 'number' } },
      { stringifyIndents: 2 });

    assert.equal(str,
      '{\n  "^[a-zA-Z_][a-zA-Z0-9_]*$": {\n    type: "number"\n  }\n}');
  });
});
