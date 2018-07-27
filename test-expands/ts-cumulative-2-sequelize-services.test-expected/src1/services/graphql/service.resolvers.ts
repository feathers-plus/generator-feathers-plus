
/* tslint:disable no-unused-variable, indent */
// Define GraphQL resolvers using only Feathers services. (Can be re-generated.)
import { App } from '../../app.interface';
import { Paginated } from '@feathersjs/feathers';
import { ResolverMap } from './graphql.interfaces';
// !code: imports // !end
// !code: init // !end

export interface ServiceResolverOptions {
  convertArgsToFeathers: any;
  extractAllItems: any;
  extractFirstItem: any;
}

let moduleExports = function serviceResolvers(app: App, options: ServiceResolverOptions) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;
  // !<DEFAULT> code: extra_auth_props
  const convertArgs = convertArgsToFeathers([]);
  // !end

  // !<DEFAULT> code: services
  let nedb1 = app.service('/nedb-1');
  let nedb2 = app.service('/nedb-2');
  // !end

  let returns: ResolverMap = {

    Nedb1: {

      // nedb2: Nedb2!
      nedb2:
        // !<DEFAULT> code: resolver-Nedb1-nedb2
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { id: parent.nedb2Id }, paginate: false
          });
          return nedb2.find(feathersParams).then(extractFirstItem);
        },
        // !end
    },

    Nedb2: {

      // nedb1: Nedb1!
      nedb1:
        // !<DEFAULT> code: resolver-Nedb2-nedb1
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { id: parent.nedb1Id }, paginate: false
          });
          return nedb1.find(feathersParams).then(extractFirstItem);
        },
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
