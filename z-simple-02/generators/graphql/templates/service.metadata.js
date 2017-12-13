
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let graphql = <%- stringifyPlus(mapping.graphql) %>;

let feathers = <%- stringifyPlus(mapping.feathers) %>;

<%- insertFragment('more') %>

let moduleExports = {
  graphql,
  feathers,
  <%- insertFragment('moduleExports') %>
};

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
