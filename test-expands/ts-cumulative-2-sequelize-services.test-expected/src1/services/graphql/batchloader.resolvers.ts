
/* tslint:disable no-unused-variable */
// Define GraphQL resolvers using Feathers services and BatchLoaders. (Can be re-generated.)
import { App } from '../../app.interface';
import { Paginated, Params } from '@feathersjs/feathers';
import { getByDot, setByDot, FGraphQLResolverMap } from 'feathers-hooks-common';
import { GraphQLFieldResolver } from 'graphql';
import { GraphQLResolveInfo } from 'graphql/type/definition';
import { ArgMap, ResolverContext } from './graphql.interfaces';

export interface BatchloaderResolverOptions {
  convertArgsToParams: any;
  convertArgsToFeathers: (args: any[]) => (...args: any[]) => Params;
  extractAllItems: any;
  extractFirstItem: any;
  feathersBatchLoader: {
    feathersBatchLoader: any,
  };
}
// !code: imports // !end
// !code: init // !end

let moduleExports = function batchLoaderResolvers(app: App, options: BatchloaderResolverOptions ) {
  // tslint:disable-next-line
  let { convertArgsToParams, convertArgsToFeathers, extractAllItems, extractFirstItem,
    feathersBatchLoader: { feathersBatchLoader } } = options;

  // !<DEFAULT> code: max-batch-size
  let defaultPaginate = app.get('paginate');
  let maxBatchSize = defaultPaginate && typeof defaultPaginate.max === 'number' ?
    defaultPaginate.max : undefined;
  // !end

  // !<DEFAULT> code: extra_auth_props
  const convertArgs = convertArgsToFeathers([]);
  // !end

  // !<DEFAULT> code: services
  let nedb1 = app.service('/nedb-1');
  let nedb2 = app.service('/nedb-2');
  // !end

  // !<DEFAULT> code: get-result
  // Given a fieldName in the parent record, return the result from a BatchLoader
  // The result will be an object (or null), or an array of objects (possibly empty).
  function getResult(
    batchLoaderName: string, fieldName: string, isArray?: boolean
  ): GraphQLFieldResolver<any, ResolverContext> {
    const contentByDot = `batchLoaders.${batchLoaderName}`;

    // `content.app = app` is the Feathers app object.
    // `content.batchLoaders = {}` is where the BatchLoaders for a request are stored.
    return (parent: any, args: ArgMap, content: ResolverContext, ast: GraphQLResolveInfo) => {
      let batchLoader = getByDot(content, contentByDot);

      if (!batchLoader) {
        batchLoader = getBatchLoader(batchLoaderName, parent, args, content, ast);
        setByDot(content, contentByDot, batchLoader);
      }

      const returns1 = batchLoader.load(parent[fieldName]);
      return !isArray ? returns1 : returns1.then((result: any) => result || []);
    };
  }
  // !end

  // A transient BatchLoader can be created only when (one of) its resolver has been called,
  // as the BatchLoader loading function may require data from the 'args' passed to the resolver.
  // Note that each resolver's 'args' are static throughout a GraphQL call.
  function getBatchLoader(
    dataLoaderName: string, parent: any, args: ArgMap, content: ResolverContext, ast: GraphQLResolveInfo
  ): FGraphQLResolverMap {
    let feathersParams;

    switch (dataLoaderName) {
    /* Persistent BatchLoaders. Stored in `content.batchLoaders._persisted`. */
    // !<DEFAULT> code: bl-persisted
    // case '_persisted.user.one.id': // service user, returns one object, key is field id
    // !end

    /* Transient BatchLoaders shared among resolvers. Stored in `content.batchLoaders._shared`. */
    // !<DEFAULT> code: bl-shared
    // *.*: User
    // case '_shared.user.one.id': // service user, returns one object, key is field id
    // !end

    /* Transient BatchLoaders used by only one resolver. Stored in `content.batchLoaders`. */

    // Nedb1.nedb2: Nedb2!
    // !<DEFAULT> code: bl-Nedb1-nedb2
    case 'Nedb1.nedb2':
      return feathersBatchLoader(dataLoaderName, '!', 'id',
        (keys: string[]) => {
          feathersParams = convertArgs(args, content, null, {
            query: { id: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return nedb2.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
      // !end

    // Nedb2.nedb1: Nedb1!
    // !<DEFAULT> code: bl-Nedb2-nedb1
    case 'Nedb2.nedb1':
      return feathersBatchLoader(dataLoaderName, '!', 'id',
        (keys: string[]) => {
          feathersParams = convertArgs(args, content, null, {
            query: { id: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return nedb1.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
      // !end

    /* Throw on unknown BatchLoader name. */
    default:
      // !<DEFAULT> code: bl-default
      throw new Error(`GraphQL query requires BatchLoader named '${dataLoaderName}' but no definition exists for it.`);
      // !end
    }
  }

  let returns: FGraphQLResolverMap = {

    Nedb1: {

      // nedb2: Nedb2!
      // !<DEFAULT> code: resolver-Nedb1-nedb2
      nedb2: getResult('Nedb1.nedb2', 'nedb2Id'),
      // !end
    },

    Nedb2: {

      // nedb1: Nedb1!
      // !<DEFAULT> code: resolver-Nedb2-nedb1
      nedb1: getResult('Nedb2.nedb1', 'nedb1Id'),
      // !end
    },

    // !code: resolver_field_more // !end
    Query: {

      // !<DEFAULT> code: query-Nedb1
      // getNedb1(query: JSON, params: JSON, key: JSON): Nedb1
      getNedb1(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast);
        return nedb1.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findNedb1(query: JSON, params: JSON): [Nedb1!]
      findNedb1(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   id: 1 } } });
        return nedb1.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      // !end

      // !<DEFAULT> code: query-Nedb2
      // getNedb2(query: JSON, params: JSON, key: JSON): Nedb2
      getNedb2(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast);
        return nedb2.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findNedb2(query: JSON, params: JSON): [Nedb2!]
      findNedb2(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   id: 1 } } });
        return nedb2.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      // !end
      // !code: resolver_query_more // !end
    },
  };

  // !code: func_return // !end
  return returns;
};

// !code: more // !end

// !code: exports // !end
export default moduleExports;

function paginate(content: any) {
  return (result: any[] | Paginated<any>) => {
    content.pagination = !isPaginated(result) ? undefined : {
      total: result.total,
      limit: result.limit,
      skip: result.skip,
    };

    return result;
  };
}

function isPaginated<T>(it: T[] | Paginated<T>): it is Paginated<T> {
  return !!(it as any).data;
}
// !code: funcs // !end
// !code: end // !end
