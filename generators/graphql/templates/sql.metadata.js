
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function sqlMetadata(app, options) {
  let { convertArgsToFeathers, convertArgsToOrderBy, convertArgsToWhere } = options;
  let makeOrderBy = convertArgsToOrderBy(options);
  let makeWhere = convertArgsToWhere(options);
  <%- insertFragment('func_init') %>

  let returns = {
<% Object.keys(serviceFieldResolvers).forEach(type => { -%>

    <%- type %>: {
      sqlTable: '<%- serviceFieldResolvers[type].sqlTable %>',
      uniqueKey: '<%- serviceFieldResolvers[type].uniqueKey %>',
      fields: {
<% Object.keys(serviceFieldResolvers[type].sqlColumn).forEach(field => { -%>
        <%- field %>: {
          sqlColumn: '<%- serviceFieldResolvers[type].sqlColumn[field] %>',
          <%- insertFragment(`fields-${type}-${field}`) %>
        },
<% }); -%>
<% Object.keys(serviceFieldResolvers[type].fields).forEach(field => { -%>

        // <%- field %><%- serviceFieldResolvers[type].fields[field].args %>: <%- serviceFieldResolvers[type].fields[field].type %>
        <%- field %>: {
<% if (serviceFieldResolvers[type].fields[field].serviceName) {
          __temp = [
            '          sqlJoin(ourTable, otherTable) { return \'ourTable.__XXX__ = otherTable.BAR\'; },',
            '          orderBy(args, content) { return makeOrderBy(args, null); },',
            '          where(table, args) { return makeWhere(table, args, \'__ZZZ__\', undefined); },',
          ];
-%>
          <%- insertFragment(`fields-${type}-${field}`, __temp) %>
<% } else { -%>
          <%- insertFragment(`fields-${type}-${field}-non`, [
            '          sqlExpr: (tableName, args) => `${tableName}.__XXX__ || \' \' || ${tableName}.__YYY__`',
]) %>
<% } -%>
        },
<% }); -%>
        <%- insertFragment(`fields-${type}`) %>
      },
      <%- insertFragment(`type-${type}`) %>
    },
<% }); -%>

    Query: {
      fields: {
<% Object.keys(queryResolvers).forEach(graphqlName => {
      __temp = [
        `        // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
        `        get${graphqlName}: {`,
        '          orderBy: (args, content) => makeOrderBy(args, {}),',
        `          where: (table, args) => makeWhere(table, args, '__XXX__'),`,
        '        },',
        '',
        `        // find${graphqlName}(query: JSON, params: JSON): [${graphqlName}!]`,
        `        find${graphqlName}: {`,
        `          orderBy: (args, content) => makeOrderBy(args, {}),`,
        `          where: (table, args) => makeWhere(table, args, '__XXX__'),`,
        '        },',
      ];
-%>

        <%- insertFragment(`query-${graphqlName}`, __temp) %>
<% }); -%>
        <%- insertFragment('metadata_query_fields') %>
      },
      <%- insertFragment('metadata_query_more') %>
    },
  <%- insertFragment('metadata_more') %>
  };

//!code: func_return //!end
return returns;
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
