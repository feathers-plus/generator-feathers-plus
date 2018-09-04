
const { promisify } = require('util');
import fs from 'fs';
// todo: Allow requires & imports to be added.
// !code: imports // !end
<%- insertFragment('imports') %>

// todo: Allow initialization to be added.
// !code: init // !end
<%- insertFragment('init') %>

// todo: Allow exports to be added. Last prop must end with a comma.
let moduleExports = {
  foo: 'bar',
  // !code: moduleExports // !end
  <%- insertFragment('moduleExports') %>
};

let moduleExports = function (...) {
  ...
  // todo: Allow function initialization to be added.
  // !code: func_init // !end
  <%- insertFragment('func_init') %>
  ...
  // todo: Allow code to modify return value.
  let returns = 'main value';
  // !code: func_return // !end
  <%- insertFragment('func_return') %>
  return returns;
}

// todo: All extra code before exports.
// !code: more // !end
<%- insertFragment('schema_more') %>

// todo: Allow exports to be modified
// !code: exports // !end
<%- insertFragment('exports') %>
module.exports = moduleExports;

export function faz() {}
// !code: export // !end
<%- insertFragment('export') %>

// todo: Allow function definitions
// !code: funcs // !end
<%- insertFragment('funcs') %>

// todo: Very end of module
// !code: end // !end
<%- insertFragment('end') %>
