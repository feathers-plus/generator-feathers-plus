
// users1-model.ts - An nedb model for user entity
import { App } from '../app.interface';

import NeDB from 'nedb';
import * as path from 'path';
// !code: nedb_imports // !end
// !code: nedb_init // !end

let moduleExports = function (app: App) {
  const dbPath = app.get('nedb');
  // !<DEFAULT> code: nedb_client
  let Model = new NeDB({
    filename: path.join(dbPath, 'users-1.db'),
    autoload: true
  });
  Model.ensureIndex({ fieldName: 'email', unique: true });
  // !end

  // !code: nedb_func_return // !end
  return Model;
};
// !code: nedb_more // !end

// !code: nedb_exports // !end
export default moduleExports;

// !code: nedb_funcs // !end
// !code: nedb_end // !end
