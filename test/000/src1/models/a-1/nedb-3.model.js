
// nedb3-model.js - An nedb model
const NeDB = require('nedb');
const path = require('path');
// !code: nedb_imports // !end
// !code: nedb_init // !end

let moduleExports = function (app) {
  const dbPath = app.get('nedb');
  // !<DEFAULT> code: nedb_client
  let Model = new NeDB({
    filename: path.join(dbPath, 'nedb-3.db'),
    autoload: true
  });
  // !end

  // !code: nedb_func_return // !end
  return Model;
};
// !code: nedb_more // !end

// !code: nedb_exports // !end
module.exports = moduleExports;

// !code: nedb_funcs // !end
// !code: nedb_end // !end
