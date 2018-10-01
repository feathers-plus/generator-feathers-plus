
// Configure the Feathers services. (Can be re-generated.)
let nedb1 = require('./nedb1/nedb1.service');
let nedb2 = require('./nedb2/nedb2.service');
let users1 = require('./users1/users1.service');

let graphql = require('./graphql/graphql.service');
// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  app.configure(nedb1);
  app.configure(nedb2);
  app.configure(users1);

  app.configure(graphql);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
