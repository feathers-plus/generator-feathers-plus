
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function sqlMetadata(app, options) {
  let { convertArgsToFeathers, convertArgsToOrderBy, convertArgsToWhere } = options;
  let makeOrderBy = convertArgsToOrderBy(options);
  let makeWhere = convertArgsToWhere(options);

  let metadata = <%- stringifyPlus(sqlMetadata) %>;

  <%- insertFragment('return') %>
  return metadata;
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
