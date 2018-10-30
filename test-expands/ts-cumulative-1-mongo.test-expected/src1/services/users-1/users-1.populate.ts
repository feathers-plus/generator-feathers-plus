
// fgraphql populate hook for service `users1`. (Can be re-generated.)
import runTime from '@feathers-plus/graphql/lib/run-time';
import { fgraphql } from 'feathers-hooks-common';
import { parse } from 'graphql';
// !<DEFAULT> code: graphql
import schema from '../../services/graphql/graphql.schemas';
import resolvers from '../../services/graphql/service.resolvers';
// !end
// !code: imports // !end
// !code: init // !end

const queries = {
  // No populate
  none: {},
  // All resolver fields 1 level deep.
  oneLevel: {
    query: {
    }
  },
  // All resolver fields 2 levels deep.
  twoLevels: {
    query: {
    }
  },
  // !code: queries // !end
};

async function users1Populate (context) {
  // tslint:disable-next-line:no-unused-variable
  const params = context.params;
  let query, options;

  if (params.$populate) return context; // another populate is calling this service

  // !<DEFAULT> code: populate
  // Example: always the same query
  ({ query, options } = queries.foo);

  // Example: select query based on user being authenticated or not
  ({ query, options } = queries[params.user ? queries.foo : queries.bar]);

  // Example: select query based on the user role
  if (params.user && params.user.roles.includes('foo')) {
    ({ query, options } = queries.foo);
  }

  // Example: allow client to provide the query
  if (params.$populateQuery) {
    ({ query, options } = params.$populateQuery);
  }

  // Populate the data.
  const newContext = await fgraphql({
    parse,
    runTime,
    schema,
    resolvers,
    recordType: 'Users1',
    query,
    options,
  })(context);

  // Prune and sanitize the data.
  // ...

  // End the hook.
  return newContext;
  // !end
}

// !code: more // !end
let moduleExports = users1Populate;

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end

/* For your information: all record and resolver fields 2 levels deep.
const twoLevelsFields = {
  query: {
    name: 1,
  }
};
*/
