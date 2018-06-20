// Initializes the `name/space/nedb2` service on path `/nedb-2`
const createService = require('feathers-nedb');
const createModel = require('../../../../models/nedb-2.model');
const hooks = require('./nedb-2.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/nedb-2', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-2');

  service.hooks(hooks);
};
