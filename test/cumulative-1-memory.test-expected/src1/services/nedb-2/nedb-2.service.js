
// Initializes the `nedb2` service on path `/nedb-2`. (Can be re-generated.)
const createService = require('feathers-memory');
const hooks = require('./nedb-2.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'nedb-2',
    paginate,
    //!code: options_more //!end
  };

  // Initialize our service with any options it requires
  app.use('/nedb-2', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('nedb-2');

  service.hooks(hooks);
};
