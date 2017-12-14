
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;

<% let __temp = Object.keys(mapping.feathers).map(name =>
  `  const ${name} = app.service('${mapping.feathers[name].path}');`
); -%>
  <%- insertFragment('services', __temp) %>

  let returns = {
<% Object.keys(serviceFieldResolvers).forEach(type => { -%>

    <%- type %>: {
<% Object.keys(serviceFieldResolvers[type].fields).forEach(field => { -%>

      // <%- field %><%- serviceFieldResolvers[type].fields[field].args %>: <%- serviceFieldResolvers[type].fields[field].type %>
      <%- field %>:
<% if (serviceFieldResolvers[type].fields[field].serviceName) {
  __temp = [
      '        // (parent, args, content, ast) => {',
      '        //   const feathersParams = convertArgsToFeathers(args, {',
      '        //     query: { $sort: {} }',
      '        //   });',
      `        //   return ${serviceFieldResolvers[type].fields[field].serviceName}.find(feathersParams).then(${serviceFieldResolvers[type].fields[field].isArray ? "extractAllItems" : "extractFirstItem"});`,
      '        // },'
  ];
-%>
        <%- insertFragment(`resolver-${type}-${field}`, __temp) %>
<% } else { -%>
        <%- insertFragment(`resolver-${type}-${field}-non`, [
          '        (parent, args, content, ast) => {},',
        ]) %>
<% } -%>
<% }); -%>
    },
<% }); -%>

    <%- insertFragment('resolver_field_more') %>

    Query: {
<% Object.keys(queryResolvers).forEach(graphqlName => {
  __temp = [
    `      // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
    `      get${graphqlName} (parent, args, content, info) {`,
    '        const feathersParams = convertArgsToFeathers(args);',
    `        return ${queryResolvers[graphqlName].schemaName}.get(args.key, feathersParams).then(extractFirstItem);`,
    '      },',
    '',
    `      // find${graphqlName}(query: JSON, params: JSON): [${graphqlName}!]`,
    `      find${graphqlName}(parent, args, content, info) {`,
    `        const feathersParams = convertArgsToFeathers(args${queryResolvers[graphqlName].moreParams});`,
    `        return ${queryResolvers[graphqlName].schemaName}.find(feathersParams).then(extractAllItems);`,
    '      },',
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
