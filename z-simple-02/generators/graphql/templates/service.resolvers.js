
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;

  return {
<% Object.keys(serviceFieldResolvers).forEach(type => { -%>
    <%- type %>: {
<% Object.keys(serviceFieldResolvers[type]).forEach(field => { -%>
      // <%- field %><%- serviceFieldResolvers[type][field].args %>: <%- serviceFieldResolvers[type][field].type %>
      <%- field %>: <%- serviceFieldResolvers[type][field].resolver.toString() %>,
<% }); -%>
    },
<% }); -%>

    <%- insertFragment('resolver_field_more') %>

    Query: {
<%- serviceQueryResolvers %>
      <%- insertFragment('resolver_query_more') %>
    },
  };
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
