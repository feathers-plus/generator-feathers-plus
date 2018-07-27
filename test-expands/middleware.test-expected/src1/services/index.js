
// Configure the Feathers services. (Can be re-generated.)
let nedb1 = require('./nedb-1/nedb-1.service');
let nedb2 = require('./nedb-2/nedb-2.service');

// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  app.configure(nedb1);
  app.configure(nedb2);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
