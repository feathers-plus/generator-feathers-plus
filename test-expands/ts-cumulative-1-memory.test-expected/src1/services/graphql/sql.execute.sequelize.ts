
// Execute raw SQL statement for GraphQL using Sequelize. (Can be re-generated.)
import { App } from '../../app.interface';
import { Sequelize } from 'sequelize';
// !code: imports // !end

let dialects: any = {
  mysql: 'mysql',
  sqlite: 'sqlite3',
  postgres: 'pg'
};
// !code: init // !end

let moduleExports = function sqlExecuteSequelize(app: App) {
  // !<DEFAULT> code: func_sequelize
  let sequelize = app.get('sequelizeClient') as Sequelize;
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
  let executeSql = (sql: string) => {
    return sequelize.query(sql)
      .then(([result]) => result)
      .catch((err: Error) => {
        // tslint:disable-next-line no-console
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
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
