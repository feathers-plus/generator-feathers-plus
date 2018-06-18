
// Initializes the `graphql` service on path `/graphql`. (Can be re-generated.)
import { App } from '../../app.interface';

import createService from '@feathers-plus/graphql';
import merge from 'lodash.merge';
import { mergeTypes } from 'merge-graphql-schemas';
import generatedSchema from './graphql.schemas';
import generatedResolvers, { ServiceResolverOptions } from './service.resolvers';
import hooks from './graphql.hooks';
// !code: imports // !end

const strategy = 'services';
// tslint:disable-next-line no-console
console.log(`\n===== configuring graphql service for ${strategy}.\n`);

let schemas = mergeTypes([
  generatedSchema,
  // !code: schemas // !end
]);

let resolvers = (app: App, options: ServiceResolverOptions) => merge({},
  generatedResolvers(app, options),
  // !code: service_resolvers // !end
);
// !code: init // !end

let moduleExports = function (app: App) {
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
export default moduleExports;

// !code: funcs // !end
// !code: end // !end

/*
Stash code not used now but which may be used if the module is regenerated.
// !code: batchloader_resolvers // !end
// !code: sql_resolvers // !end
// !code: sql_metadata // !end
*/
