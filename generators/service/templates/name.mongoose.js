
const mongoose = require('mongoose');
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = Object.assign({},
  <%- insertFragment('model', mongooseSchemaStr.split('\n').map(str => `  ${str}`).join('\n')) %>
  <%- insertFragment('moduleExports') %>
);

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
