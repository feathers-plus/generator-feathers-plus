// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('@feathers-x/graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const hooks = require('./graphql.hooks');

const metadata = {
  Comment: { service: 'comment' },
  Like: { service: 'like' },
  Post: { service: 'post' },
  Relationship: { service: 'relationship' },
  User: { service: 'user' }
};
/*
const schemas = mergeTypes([
  // todo require('.../users.schema.js'),
]);

const resolvers = Object.assign({},
  // todo require('.../users.resolvers.js')
  // todo require('.../users.query.js')
);
*/
const schemas = require('./graphql.schemas');

const resolvers = require('./graphql.resolvers');

module.exports = function(){
  const app = this;

  console.log('\n===== configuring graphql service for custom Feathers services resolvers.\n'); // eslint-disable-line

  const options = {
    schemas,
    metadata,
    resolvers,
  };

  // Initialize our service with any options it requires.
  const createdService = createService(options);
  app.use('/graphql', createdService);

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('/graphql');

  service.hooks(hooks);
};