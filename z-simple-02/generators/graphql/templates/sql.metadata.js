
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

let moduleExports = function sqlMetadata(app, options) {
  let { convertArgsToFeathers, convertArgsToOrderBy, convertArgsToWhere } = options;
  let makeOrderBy = convertArgsToOrderBy(options);
  let makeWhere = convertArgsToWhere(options);
  <%- insertFragment('func_init') %>

  let returns = <%- stringifyPlus(sqlMetadata) %>;

  <%- insertFragment('func_return') %>
  return returns;
};

<%- insertFragment('more') %>

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
