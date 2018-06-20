// Initializes the `nedb1` service on path `/nedb-1`
const createService = require('feathers-nedb');
const createModel = require('../../models/nedb-1.model');
const hooks = require('./nedb-1.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/nedb-1', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-1');

  service.hooks(hooks);
};
