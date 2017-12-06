
// Defines NeDB model for service `<%= name %>`.
const deepMerge = require('deepmerge');
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = deepMerge.all([{},
  <%- insertFragment('model', nedbSchemaStr.split('\n').map(str => `  ${str}`).join('\n') + ',') %>
  <%- insertFragment('moduleExports') %>
]);

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
