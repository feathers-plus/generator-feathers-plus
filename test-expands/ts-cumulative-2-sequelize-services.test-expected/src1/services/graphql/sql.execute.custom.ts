
// Execute raw SQL statement for GraphQL using a custom interface. (Can be re-generated.)
import { App } from '../../app.interface';
// !code: imports // !end
// !code: init // !end

// tslint:disable-next-line no-unused-variable
let moduleExports = function sqlExecuteCustom(app: App) {
  // !code: func_custom // !end
  // !<DEFAULT> code: func_dialect
  // tslint:disable-next-line no-unused-variable
  let dialect: 'sqlite3' | 'mariadb' | 'mysql' | 'pg' | 'oracle' = null;
  if (!dialect) {
    throw new Error('Unsupported Custom dialect: \'' + dialect + '\'. (sql.execute.custom.*s)');
  }
  // !end
  // !code: func_init // !end

  // An async function that takes an SQL statement queries a database and resolves to an array of objects
  // !<DEFAULT> code: func_exec
  // tslint:disable-next-line no-unused-variable
  async function executeSql(sql: string): Promise<any[]> {
    throw new Error('No function for GraphQL SQL execution provided. You need to provide one in ' + __filename);
    // tslint:disable-next-line
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
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
