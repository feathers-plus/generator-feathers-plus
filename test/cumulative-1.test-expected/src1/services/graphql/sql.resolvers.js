
/* eslint-disable no-unused-vars */
// Define GraphQL resolvers for forming raw SQL statements. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

let moduleExports = function sqlResolvers(app, options) {
  let { dialect, executeSql, genAndRunSql } = options;
  let genRunSql = genAndRunSql(executeSql, { dialect }, options);

  const returns = {
    // !code: resolver_field_more // !end

    Query: {

      // !code: resolver_query_more // !end
    },
  };

  // !code: func_return // !end
  return returns;
};

// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
