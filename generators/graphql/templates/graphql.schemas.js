
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = `
<%- graphqlSchemas %>
`;

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
