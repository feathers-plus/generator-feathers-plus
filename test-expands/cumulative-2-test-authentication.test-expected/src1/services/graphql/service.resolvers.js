
/* eslint-disable no-unused-vars, indent */
// Define GraphQL resolvers using only Feathers services. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

let moduleExports = function serviceResolvers(app, options) {
  const {convertArgsToFeathers, extractAllItems, extractFirstItem} = options;
  // !<DEFAULT> code: extra_auth_props
  const convertArgs = convertArgsToFeathers([]);
  // !end

  // !<DEFAULT> code: services
  let nedb1 = app.service('/nedb-1');
  let nedb2 = app.service('/nedb-2');
  // !end

  let returns = {

    Nedb1: {

      // nedb2: Nedb2!
      nedb2:
        // !<DEFAULT> code: resolver-Nedb1-nedb2
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { _id: parent.nedb2Id }, paginate: false
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
            query: { _id: parent.nedb1Id }, paginate: false
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
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   _id: 1 } } });
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
        const feathersParams = convertArgs(args, content, ast, { query: { $sort: {   _id: 1 } } });
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
module.exports = moduleExports;

function paginate(content) {
  return result => {
    content.pagination = !result.data ? undefined : {
      total: result.total,
      limit: result.limit,
      skip: result.skip,
    };

    return result;
  };
}

// !code: funcs // !end
// !code: end // !end
