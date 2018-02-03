
const traverse = require('traverse');
const { ObjectID } = require('mongodb');
const { inspect } = require('util');

function mongoObjectId(ObjectID, keyFields) {
  keyFields = Array.isArray(keyFields) ? keyFields : [keyFields];
  // $lt, $lte, $gt, $gte are debatable. $or is invalid.
  const allowedProps = ['$in', '$nin', '$ne', '$lt', '$lte', '$gt', '$gte'];
  const keyLeaves = [];

  const keysInfo = keyFields.map(field => {
    const fieldNames = field.split('.');
    const leaf = fieldNames.slice(-1)[0];
    keyLeaves.push(leaf);

    return { leaf, len: fieldNames.length, path: JSON.stringify(fieldNames) };
  });

  return context => {
    const query = context.params.query || {};
    let found = false; // for test only

    traverse(query).forEach(function (node) {
      const typeofNode = typeof node;
      const key = this.key;
      const path = this.path;

      if (keyLeaves.indexOf(key) === -1) return;

      keysInfo.forEach(info => {
        if (info.leaf === key && info.len <= path.length) {
          const endPath = path.slice(-info.len);
          if (JSON.stringify(endPath) === info.path) {

            if (typeofNode === 'object' && node !== null && !Array.isArray(node)) {
              const actualProps = Object.keys(node);
              if (actualProps.length === 1 && allowedProps.indexOf(actualProps[0]) !== -1) {
                console.log('found', info.path, 'in path', this.path, 'key value=', node);
                found = true;
              }
            } else if (typeofNode === 'string' || typeofNode === 'number') {
              console.log('found', info.path, 'in path', this.path, 'key value=', node);
              found = true;
            }
          }
        }
      });
    });

    if (!found) console.log('no key found');
  };
}

const tests = [
  { keys: 'a',        query: { a: 1, c: 0 } },
  { keys: 'a',        query: { a: { b: 0 }, c: 0 } },
  { keys: 'a',        query: { a: { $in: [1, 2] }, c: 0 } },
  { keys: 'b',        query: { b: '111111111111', c: 0 } },
  { keys: ['a', 'b'], query: { a: 1, b: '111111111111', c: 0 } },
  { keys: 'a.x',      query: { a: { x: 8 } } },
  { keys: ['b', 'a.x'],      query: { $or: [{ a: { x: 8 } }, { b: 5 }] } },
  // questionable tests
  { keys: ['a', 'a.x'],      query: { $or: [{ a: { x: 8 } }, { a: 5 }] } },
];

tests.forEach(test => {
  console.log('\n=== keys=', test.keys, 'query=', pretty(test.query));
  mongoObjectId(ObjectID, test.keys)({ params: { query: test.query } });
});

function pretty(obj, depth = 5) {
  return inspect(obj, { colors: true, depth });
}
