
// Execute raw SQL statement for GraphQL using Knex. (Can be re-generated.)
// !code: imports // !end

let dialects = {
  mysql: 'mysql',
  sqlite: 'sqlite3',
  postgres: 'pg'
};
// !code: init // !end

let moduleExports = function sqlExecuteKnex(app) {
  // !<DEFAULT> code: func_knex
  let knex = app.get('knexClient');
  if (!knex) {
    throw new Error('No Knex client. (sql.execute.knex.*s)');
  }
  // !end

  // !<DEFAULT> code: func_dialect
  let dialect = dialects[knex.client.dialect];
  if (!dialect) {
    throw new Error('Unsupported Knex dialect: \'' + knex.client.dialect + '\'. (sql.execute.knex.*s)');
  }
  // !end
  // !code: func_init // !end

  // !<DEFAULT> code: func_exec
  let executeSql = sql => {
    return knex.raw(sql)
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log('executeSql error=', err.message);
        throw err;
      });
  };
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
