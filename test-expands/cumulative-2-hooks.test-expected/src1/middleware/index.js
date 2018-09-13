
// Configure middleware. (Can be re-generated.)
const mw1 = require('./mw-1');
const mw2 = require('./mw-2');
// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  // !code: func_init // !end
  // Add your custom middleware here. Remember that
  // in Express, the order matters.
  // Your middleware should include:
  //   app.use(mw1());
  //   app.use('mw2', mw2());
  // !<DEFAULT> code: middleware
  app.use(mw1());
  app.use('mw2', mw2());
  // !end
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
