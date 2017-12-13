
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;

<% let __temp = Object.keys(mapping.feathers).map(name =>
  `  const ${name} = app.service('${mapping.feathers[name].path}');`
); -%>
  <%- insertFragment('services', __temp) %>

  return {
<% Object.keys(serviceFieldResolvers).forEach(type => { -%>

    <%- type %>: {
<% Object.keys(serviceFieldResolvers[type]).forEach(field => { -%>

      // <%- field %><%- serviceFieldResolvers[type][field].args %>: <%- serviceFieldResolvers[type][field].type %>
      <%- field %>:
<% if (serviceFieldResolvers[type][field].serviceName) {
  __temp = [
      '        // (parent, args, content, ast) => {',
      '        //   const feathersParams = convertArgsToFeathers(args, {',
      '        //     query: { $sort: {} }',
      '        //   });',
      `        //   return ${serviceFieldResolvers[type][field].serviceName}.find(feathersParams).then(${serviceFieldResolvers[type][field].isArray ? "extractAllItems" : "extractFirstItem"});`,
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
<% Object.keys(serviceQueryResolvers).forEach(graphqlName => {
  __temp = [
    `      // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
    `      get${graphqlName} (parent, args, content, info) {`,
    '        const feathersParams = convertArgsToFeathers(args);',
    `        return options.services.${serviceQueryResolvers[graphqlName].schemaName}.get(args.key, feathersParams).then(extractFirstItem);`,
    '      },',
    '',
    `      // find${graphqlName}(query: JSON, params: JSON): [${graphqlName}!]`,
    `      find${graphqlName}(parent, args, content, info) {`,
    `        const feathersParams = convertArgsToFeathers(args${serviceQueryResolvers[graphqlName].moreParams});`,
    `        return options.services.${serviceQueryResolvers[graphqlName].schemaName}.find(feathersParams).then(extractAllItems);`,
    '      },',
  ];
-%>

      <%- insertFragment(`query-${graphqlName}`, __temp) %>
<% }); -%>
      <%- insertFragment('resolver_query_more') %>
    },
  };
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
