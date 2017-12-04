
// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('@feathers-x/graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const hooks = require('./graphql.hooks');
<%- insertFragment('imports') %>

<%- insertFragment('schemas', [
  'const schemas = require(\'./graphql.schemas\');',
  '// const schemas = mergeTypes([',
  '//   require(\'./graphql.schemas\'),',
  '//   // other schemas',
  '// ]);',
]) %>

<% if (resolvers[0] === 'resolvers' || resolvers.length === 2) { -%>
// Setup for using Feathers service resolvers.

<%- insertFragment('service_resolvers', [
    'const serviceResolvers = require(\'./service.resolvers\');',
    '// const serviceResolvers = (app, options) => Object.assign({},',
    '//   require(\'./service.resolvers\')(app, options),',
    '//   // other service resolvers',
    '// );',
]) %>

<%- insertFragment('service_metadata', [
  'const metadata = require(\'./graphql.metadata\').graphql;',
  '// const metadata = Object.assign({},',
  '//   require(\'./graphql.metadata\').graphql,',
  '//   // other service metadata',
  '// );',
]) %>
<% } -%>

<% if (resolvers[0] === 'sql' || resolvers.length === 2) { -%>
// Setup for using SQL statement resolvers.

const { dialect, executeSql, openDb } = require('./sql.execute');
<%- insertFragment('sql_resolvers', [
  'const sqlResolvers = require(\'./sql.resolvers\');',
  '// const sqlResolvers = Object.assign({},',
  '//   require(\'./sql.resolvers\'),',
  '//   // other sql resolvers',
  '// );',
]) %>

<%- insertFragment('service_metadata', [
  'const sqlJoins = require(\'./sql.metadata\');',
  '// const sqlJoins = Object.assign({},',
  '//   require(\'./sql.metadata\'),',
  '//   // other sql metadata',
  '// );',
]) %>

if (!dialect) {
  throw new Error('services/graphql/sql.execute.js has not been configured.');
}

<% } -%>
<% if (resolvers.length === 2) { -%>
// Setup for using both Feathers service and SQL statement resolvers.

<%- insertFragment('service_either', [
  'const usingSql = true;',
]) %>
<% } -%>

let moduleExports = function(){
  const app = this;
  //!code: func_init //!end

  console.log('\n===== configuring graphql service for custom Feathers services resolvers.\n'); // eslint-disable-line

  const options = {
<% if (resolvers.length === 1 && resolvers[0] === 'resolvers') { -%>
    schemas,
    metadata,
    resolvers: serviceResolvers,
<% } -%>
<% if (resolvers.length === 1 && resolvers[0] === 'sql') { -%>
    schemas,
    resolvers: sqlResolvers,
    sqlJoins,
    dialect,
    executeSql,
    openDb,
    logSql: false,
<% } -%>
<% if (resolvers.length === 2) { -%>
    schemas,
    metadata,
    resolvers: usingSql ? sqlResolvers : serviceResolvers,
    sqlJoins,
    dialect,
    executeSql,
    openDb: usingSql ? openDb : undefined,
    logSql: false,
<% } -%>
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
