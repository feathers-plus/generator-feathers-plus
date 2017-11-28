
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let schema = {
  $schema: 'http://json-schema.org/draft-05/schema',
  <%- insertFragment('schema_header', [
    '  title: \'...\',',
    '  description: \'...\',',
  ])
  %>
  type: 'object',
  required: [
    <%- insertFragment('schema_required') %>
  ],
  properties: {
    <%- insertFragment('schema_properties') %>
  },
  <%- insertFragment('schema_more') %>
};

let extension = {
  graphql: {
    <%- insertFragment('extension_header', [
    '    // name: \'...\',',
    '    // sort: { id: 1 },',
    ])
    %>
    discard: [
      <%- insertFragment('extension_discard') %>
    ],
    add: {
      <%- insertFragment('extension_add', [
      '      // comments: \'[Comment!]\',',
      ])
      %>
    },
    <%- insertFragment('extension_more') %>
  },
};

<%- insertFragment('more') %>

let moduleExports = {
  schema,
  extension,
  <%- insertFragment('moduleExports') %>
};

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
