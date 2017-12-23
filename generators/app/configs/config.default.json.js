<%- insertFragment('imports') %>
<%- insertFragment('init') %>

module.exports = function() {
  <%- insertFragment('func_init') %>

  let config = {
    <%- insertFragment('host', [
      'host: \'localhost\',',
      'port: 3030,',
    ]) %>
    <%- insertFragment('public', [
      'public: \'../public\/',',
    ]) %>
    <%- insertFragment('paginate', [
      'paginate: {',
      '  default: 10,',
      '  max: 50',
      '},',
    ]) %>
    <%- insertFragment('config_more') %>
  };

  <%- insertFragment('func_return') %>
  return config;
};

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>