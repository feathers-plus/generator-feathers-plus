
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;

  return {
<% Object.keys(graphqlAddResolvers).forEach(type => { -%>
    <%- type %>: {
<% Object.keys(graphqlAddResolvers[type]).forEach(field => { -%>
      // <%- field %><%- graphqlAddResolvers[type][field].args %>: <%- graphqlAddResolvers[type][field].type %>
      <%- field %>: <%- graphqlAddResolvers[type][field].resolver.toString() %>,
<% }); -%>
    },
<% }); -%>

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
