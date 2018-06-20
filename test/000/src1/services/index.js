
// Configure the Feathers services. (Can be re-generated.)
let nedb1 = require('./nedb-1/nedb-1.service');
let nedb2 = require('./a-1/nedb-2/nedb-2.service');
let nedb3 = require('./a-1/nedb-3/nedb-3.service');
let nedb4 = require('./a-1/b-1/nedb-4/nedb-4.service');
let nedb5 = require('./a-1/b-1/nedb-5/nedb-5.service');
let nedb6 = require('./c-1/nedb-6/nedb-6.service');

// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  app.configure(nedb1);
  app.configure(nedb2);
  app.configure(nedb3);
  app.configure(nedb4);
  app.configure(nedb5);
  app.configure(nedb6);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
