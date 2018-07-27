
// Execute raw SQL statement for GraphQL using Sequelize. (Can be re-generated.)
// !code: imports // !end

let dialects = {
  mysql: 'mysql',
  sqlite: 'sqlite3',
  postgres: 'pg'
};
// !code: init // !end

let moduleExports = function sqlExecuteSequelize(app) {
  // !<DEFAULT> code: func_sequelize
  let sequelize = app.get('sequelizeClient');
  if (!sequelize) {
    throw new Error('No Sequelize client. (sql.execute.sequelize.*s)');
  }
  // !end

  // !<DEFAULT> code: func_dialect
  let dialect = dialects[sequelize.getDialect()];
  if (!dialect) {
    throw new Error('Unsupported Sequelize dialect: \'' + sequelize.getDialect() + '\'. (sql.execute.sequelize.*s)');
  }
  // !end
  // !code: func_init // !end

  // !<DEFAULT> code: func_exec
  let executeSql = sql => {
    return sequelize.query(sql)
      .then(([result]) => result)
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
