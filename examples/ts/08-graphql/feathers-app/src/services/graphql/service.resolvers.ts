
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
  let roles = app.service('/roles');
  let teams = app.service('/teams');
  let users = app.service('/users');
  // !end

  let returns: ResolverMap = {

    Role: {

      // users: [User!]
      users:
        // !<DEFAULT> code: resolver-Role-users
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { roleId: parent._id, $sort: undefined }, paginate: false
          });
          return users.find(feathersParams).then(extractAllItems);
        },
        // !end
    },

    Team: {

      // members: [User!]
      members:
        // !<DEFAULT> code: resolver-Team-members
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { _id: parent.memberIds, $sort: 
              {
                lastName: 1,
                firstName: 1
              } }, paginate: false
          });
          return users.find(feathersParams).then(extractAllItems);
        },
        // !end
    },

    User: {

      // fullName: String!
      fullName:
        // !<DEFAULT> code: resolver-User-fullName-non
        (parent, args, content, ast) => { throw Error('GraphQL fieldName User.fullName is not calculated.'); },
        // !end

      // role(query: JSON, params: JSON, key: JSON): Role
      role:
        // !<DEFAULT> code: resolver-User-role
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { _id: parent.roleId }, paginate: false
          });
          return roles.find(feathersParams).then(extractFirstItem);
        },
        // !end

      // teams(query: JSON, params: JSON, key: JSON): [Team!]
      teams:
        // !<DEFAULT> code: resolver-User-teams
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { memberIds: parent._id, $sort: 
              {
                name: 1
              } }, paginate: false
          });
          return teams.find(feathersParams).then(extractAllItems);
        },
        // !end
    },

    // !code: resolver_field_more // !end

    Query: {

      // !<DEFAULT> code: query-Role
      // getRole(query: JSON, params: JSON, key: JSON): Role
      getRole(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast);
        return roles.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findRole(query: JSON, params: JSON): [Role!]
      findRole(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   name: 1 } } });
        return roles.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      // !end

      // !<DEFAULT> code: query-Team
      // getTeam(query: JSON, params: JSON, key: JSON): Team
      getTeam(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast);
        return teams.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findTeam(query: JSON, params: JSON): [Team!]
      findTeam(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   name: 1 } } });
        return teams.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      // !end

      // !<DEFAULT> code: query-User
      // getUser(query: JSON, params: JSON, key: JSON): User
      getUser(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast);
        return users.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findUser(query: JSON, params: JSON): [User!]
      findUser(parent, args, content, ast) {
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   lastName: 1,   firstName: 1 } } });
        return users.find(feathersParams).then(paginate(content)).then(extractAllItems);
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
