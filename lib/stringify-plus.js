
// JSON.stringify retaining functions, regexp and undefined. Don't quote prop names.

const traverse = require('traverse');

const isNative = require('./is-native');

const defaultNativeFuncs = {
  [Array]: 'Array',
  [Boolean]: 'Boolean',
  [Buffer]: 'Buffer',
  [Date]: 'Date',
  [Date.now]: 'Date.now',
  [Number]: 'Number',
  [Object]: 'Object',
  [String]: 'String',
};

module.exports = function stringify (obj, options = {}) {
  const nativeFuncs = Object.assign({}, defaultNativeFuncs, options.nativeFuncs || []);
  const stringifyIndents = options.stringifyIndents || 2;
  const indentBy = ' '.repeat(options.indentBy || 0);
  const replacer = options.replacer || null;
  const cache = {};
  let count = 0;
  
  // replace values JSON.stringify drops
  const obj1 = traverse(obj).map(function (value) { // IMPORTANT 'function' is needed
    if (this.isLeaf) {
      if (typeof value === 'function' || value === undefined || value instanceof RegExp) {
        const str = (count++).toString();
        const paddedStr = '00000'.substring(0, 5 - str.length) + str;
        const key = `<%{{${paddedStr}}}%>`;
        
        cache[`"${key}"`] = value;
        this.update(key);
      }
    }
  });
  
  let stringified = JSON.stringify(obj1, replacer, stringifyIndents);
  
  // prettify
  stringified = stringified.split('\n').map(line => {
    line = `${indentBy}${line}`;
    const start = line.search(/\S/);
    
    if (start === -1 || line.substr(start, 1) !== '"') { return line; }
    
    return line.indexOf('": ') === -1 ? line : line.replace('"', '').replace('": ', ': ');
  });
  
  stringified = stringified.join('\n');
  
  // restore dropped values
  Object.keys(cache).forEach(key => {
    const value = cache[key];
    
    if (value === undefined) {
      stringified = stringified.replace(key, 'undefined');
      return;
    }
    
    if (value instanceof RegExp) {
      stringified = stringified.replace(key, value.toString());
      return;
    }
    
    // native function
    const str = nativeFuncs[value];
    
    if (!str && isNative(value)) {
      throw new Error(`Unsupported native function ${value.toString()}. (code-writer)}`);
    }

    if (str) {
      stringified = stringified.replace(key, str);
      return;
    }

    // user function starting with foo: function...
    // user function starting with foo: (bar...
    const func = value.toString();
    const propNameEndsAt = stringified.indexOf(key);
    stringified = stringified.replace(key, func);
    if (func.substr(0, 8) === 'function' || func.charAt(0) === '(') return

    // user function starting with foo: bar =>...
    // todo cannot handle foo: bar=>...
    const j = func.indexOf(' ');
    if (func.substr(j, 3) === ' =>') return;

    // user function currently starting with foo: foo(bar)... or foo: foo (bar)...
    const funcName = func.substr(0, func.indexOf('(')).trim();
    stringified = stringified.substr(0, propNameEndsAt - funcName.length - 2) + stringified.substr(propNameEndsAt);
  });

  return stringified;
};
