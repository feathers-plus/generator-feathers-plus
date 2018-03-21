
// Execute raw SQL statement for GraphQL using Knex. (Can be re-generated.)
const { getByDot } = require('feathers-hooks-common');
// !code: imports // !end

let dialects = {
  mysql: 'mysql',
  sqlite: 'sqlite3',
  postgres: 'pg'
};
// !code: init // !end

let moduleExports = function sqlExecuteKnex(app) {
  let generatorSpecs = app.get('generatorSpecs');
  let knex = app.get('knexClient');
  let database = getByDot(generatorSpecs, 'connections.knex.database');
  let dialect = dialects[database];
  // !code: func_init // !end

  if (!knex) {
    throw new Error('No knex client');
  }
  if (!dialect) {
    throw new Error(`Unsupported dialect: '${dialect}'`);
  }

  let executeSql = sql => knex.raw(sql)
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log('executeSql error=', err.message);
      throw err;
    });

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
