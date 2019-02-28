
// Initializes the `nedb3` service on path `/nedb-3`. (Can be re-generated.)
const createService = require('feathers-nedb');
const createModel = require('../../../models/a-1/nedb-3.model');
const hooks = require('./nedb-3.hooks');
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');
  // !code: func_init // !end

  let options = {
    Model,
    paginate,
    // !code: options_more // !end
  };
  // !code: options_change // !end

  // Initialize our service with any options it requires
  // !<DEFAULT> code: extend
  app.use('/nedb-3', createService(options));
  // !end

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-3');

  service.hooks(hooks);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
