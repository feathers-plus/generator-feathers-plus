
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;

  return {
    <% Object.keys(graphqlAddResolvers).forEach(type => { -%>
    <%- type %>: {<% graphqlAddResolvers[type].forEach(field => { %>
      <%- field %>: (parent, args, info, ast) => null,<% }); -%>
    },<% }); %>

    <%- insertFragment('resolver_type_more') %>

    Query: {
<%- graphqlResolvers %>
      <%- insertFragment('resolver_query_more') %>
    },
  };
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
