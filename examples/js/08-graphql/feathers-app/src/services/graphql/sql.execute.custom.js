
// Execute raw SQL statement for GraphQL using a custom interface. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function sqlExecuteCustom(app) {
  // !code: func_custom // !end
  // !<DEFAULT> code: func_dialect
  // eslint-disable-next-line no-unused-vars
  let dialect = null;
  if (!dialect) {
    throw new Error('Unsupported Custom dialect: \'' + dialect + '\'. (sql.execute.custom.*s)');
  }
  // !end
  // !code: func_init // !end

  // An async function that takes an SQL statement queries a database and resolves to an array of objects
  // !<DEFAULT> code: func_exec
  // eslint-disable-next-line no-unused-vars
  async function executeSql(sql) {
    throw new Error('No function for GraphQL SQL execution provided. You need to provide one in ' + __filename);
    // eslint-disable-next-line
    return [];
  }
  // !end

  let returns = {
    dialect,
    executeSql,
    openDb: undefined
    // !code: moduleExports // !end
  };

  // !code: func_return // !end
  return returns;
};
// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
