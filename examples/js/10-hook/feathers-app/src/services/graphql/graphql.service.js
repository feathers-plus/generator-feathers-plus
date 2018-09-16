
// Initializes the `graphql` service on path `/graphql`. (Can be re-generated.)
const createService = require('@feathers-plus/graphql');
const merge = require('lodash.merge');
const { mergeTypes } = require('merge-graphql-schemas');
const generatedSchema = require('./graphql.schemas');
const generatedResolvers = require('./service.resolvers');
const hooks = require('./graphql.hooks');
// !code: imports // !end

const strategy = 'services';
// eslint-disable-next-line no-console
console.log(`\n===== configuring graphql service for ${strategy}.\n`);

let schemas = mergeTypes([
  generatedSchema,
  // !code: schemas // !end
]);

let resolvers = (app, options) => merge({},
  generatedResolvers(app, options),
  // !code: service_resolvers // !end
);
// !code: init // !end

let moduleExports = function () {
  const app = this;
  // !code: func_init // !end

  let options = {
    schemas,
    resolvers,
  };
  // !code: func_options // !end

  // Initialize our service with any options it requires.
  const createdService = createService(options);
  app.use('/graphql', createdService);

  // Get our initialized service so that we can register hooks
  const service = app.service('/graphql');

  service.hooks(hooks);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end

/*
Stash code not used now but which may be used if the module is regenerated.
// !code: batchloader_resolvers // !end
// !code: sql_resolvers // !end
// !code: sql_metadata // !end
*/
