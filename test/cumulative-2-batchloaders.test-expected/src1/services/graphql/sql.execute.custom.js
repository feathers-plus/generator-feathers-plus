
// Execute raw SQL statement for GraphQL using a custom interface. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

let moduleExports = function sqlExecuteCustom(app) {
  // eslint-disable-next-line no-unused-vars
  let generatorSpecs = app.get('generatorSpecs');
  // !<DEFAULT> code: dialect
  // eslint-disable-next-line no-unused-vars
  let dialect = null;
  // !end
  // !code: func_init // !end

  if (!dialect) {
    throw new Error(`Unsupported dialect: '${dialect}'`);
  }

  // An async function that takes an SQL statement queries a database and resolves to an array of objects
  // eslint-disable-next-line no-unused-vars
  async function executeSql(sql) {
    throw new Error(`No function for GraphQL SQL execution provided. You need to provide one in ${ __filename }`);
    // eslint-disable-next-line
    return [];
  }

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
