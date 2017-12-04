
// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('@feathers-x/graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const hooks = require('./graphql.hooks');
<%- insertFragment('imports') %>

<%- insertFragment('metadata', [
  'const metadata = require(\'./graphql.metadata\').graphql;',
  '// const metadata = Object.assign({},',
  '//   require(\'./graphql.metadata\').graphql,',
  '//   ...',
  '// );',
]) %>

<%- insertFragment('schemas', [
  'const schemas = require(\'./graphql.schemas\');',
  '// const schemas = mergeTypes([',
  '//   require(\'./graphql.schemas\'),',
  '//   ...',
  '// ]);',
]) %>

<%- insertFragment('resolvers', [
  'const resolvers = require(\'./service.resolvers\');',
  '// const resolvers = (app, options) => Object.assign({},',
  '//   require(\'./service.resolvers\')(app, options),',
  '//   ...',
  '// );',
]) %>

let moduleExports = function(){
  const app = this;
  //!code: func_init //!end

  console.log('\n===== configuring graphql service for custom Feathers services resolvers.\n'); // eslint-disable-line

  const options = {
    schemas,
    metadata,
    resolvers,
    //!code: func_options //!end
  };

  // Initialize our service with any options it requires.
  const createdService = createService(options);
  app.use('/graphql', createdService);

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('/graphql');

  service.hooks(hooks);
  //!code: func_return //!end
};

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
