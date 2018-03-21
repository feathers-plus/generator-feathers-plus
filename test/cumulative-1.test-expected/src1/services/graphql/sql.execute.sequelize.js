
// Execute raw SQL statement for GraphQL using Sequelize. (Can be re-generated.)
const { getByDot } = require('feathers-hooks-common');
// !code: imports // !end

let dialects = {
  mysql: 'mysql',
  sqlite: 'sqlite3',
  postgres: 'pg'
};
// !code: init // !end

let moduleExports = function sqlExecuteSequelize(app) {
  let generatorSpecs = app.get('generatorSpecs');
  let sequelize = app.get('sequelizeClient');
  let database = getByDot(generatorSpecs, 'connections.sequelize.database');
  let dialect = dialects[database];
  // !code: func_init // !end

  if (!sequelize) {
    throw new Error('No Sequelize client');
  }
  if (!dialect) {
    throw new Error(`Unsupported dialect: '${sequelize.getDialect()}'`);
  }

  let executeSql = sql => sequelize.query(sql)
    .then(([result]) => result)
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
