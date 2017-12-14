
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function sqlResolvers(app, options) {
  let { dialect, executeSql, genAndRunSql } = options;
  let genRunSql = genAndRunSql(executeSql, { dialect }, options);

  const returns = {
    <%- insertFragment('resolver_field_more') %>

    Query: {
<% Object.keys(queryResolvers).forEach(graphqlName => {
  __temp = [
    `      // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
    `      get${graphqlName}: (parent, args, content, info) => genRunSql(content, info),`,
    '',
    `      // find${graphqlName}(query: JSON, params: JSON, key: JSON): [${graphqlName}!]`,
    `      find${graphqlName}: (parent, args, content, info) => genRunSql(content, info),`,
  ];
-%>

      <%- insertFragment(`query-${graphqlName}`, __temp) %>
<% }); -%>

      <%- insertFragment('resolver_query_more') %>
    },
  };

  //!code: func_return //!end
  return returns;
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
