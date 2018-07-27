
// Initializes the `nedb1` service on path `/nedb-1`. (Can be re-generated.)
const createService = require('feathers-memory');
const hooks = require('./nedb-1.hooks');
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) {

  let paginate = app.get('paginate');
  // !code: func_init // !end

  let options = {
    paginate,
    // !code: options_more // !end
  };
  // !code: options_change // !end

  // Initialize our service with any options it requires
  app.use('/nedb-1', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-1');

  service.hooks(hooks);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
