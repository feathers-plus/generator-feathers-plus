
// fgraphql populate hook for service `nedb2`. (Can be re-generated.)
import runTime from '@feathers-plus/graphql/lib/run-time';
import { fgraphql, serialize, FGraphQLHookOptions, SyncContextFunction, SerializeSchema } from 'feathers-hooks-common';
import { Query, HookContext } from '@feathersjs/feathers';
import { parse } from 'graphql';
// !<DEFAULT> code: graphql
import schema from '../../services/graphql/graphql.schemas';
import resolvers from '../../services/graphql/service.resolvers';
// !end
// !code: imports // !end
// !code: init // !end

const queries: {[s: string]: { query?: Query | SyncContextFunction<Query>, options?: FGraphQLHookOptions, serializer?: SerializeSchema | SyncContextFunction<SerializeSchema>}} = {
  // No populate
  none: {},
  // All resolver fields 1 level deep.
  oneLevel: {
    query: {
      nedb1: {},
    }
  },
  // All resolver fields 2 levels deep.
  twoLevels: {
    query: {
      nedb1: {
        nedb2: {},
      },
    }
  },
  // !code: queries // !end
};

async function nedb2Populate (context: HookContext) {
  // tslint:disable-next-line:no-unused-variable
  const params = context.params;
  let query, options, serializer;

  if (params.$populate) { return context; } // another populate is calling this service

  // !<DEFAULT> code: populate
  // Example: always the same query
  ({ query, options, serializer } = queries.foo);

  // Example: select query based on user being authenticated or not
  ({ query, options, serializer } = queries[params.user ? queries.foo : queries.bar]);

  // Example: select query based on the user role
  if (params.user && params.user.roles.includes('foo')) {
    ({ query, options, serializer } = queries.foo);
  }

  // Example: allow client to provide the query
  if (params.$populateQuery) {
    ({ query, options, serializer } = params.$populateQuery);
  }

  // Populate the data.
  let newContext: any = await fgraphql({
    parse,
    runTime,
    schema,
    resolvers,
    recordType: 'Nedb2',
    query,
    options,
  })(context);

  // Prune and sanitize the data.
  if (serializer) {
    newContext = serialize(serializer)(newContext);
  }

  // End the hook.
  return newContext;
  // !end
}

// !code: more // !end
let moduleExports = nedb2Populate;

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end

/* For your information: all record and resolver fields 2 levels deep.
const twoLevelsFields = {
  query: {
    id: 1,
    _id: 1,
    nedb1Id: 1,
    nedb1: {
      _args: {},
      id: 1,
      _id: 1,
      nedb2Id: 1,
      nedb2: {},
    },
  }
};
*/
