
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function sqlResolvers(app, options) {
  let { dialect, executeSql, genAndRunSql } = options;
  let genRunSql = genAndRunSql(executeSql, { dialect }, options);

  return {
    <%- insertFragment('resolver_field_more') %>

    Query: {
<%- sqlQueryResolvers %>
      <%- insertFragment('resolver_query_more') %>
    },
  };
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
