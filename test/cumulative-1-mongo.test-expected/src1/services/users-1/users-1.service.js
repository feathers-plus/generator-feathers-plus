
// Initializes the `users1` service on path `/users-1`
const createService = require('feathers-mongodb');
const hooks = require('./users-1.hooks');
// !<DEFAULT> code: mongo_imports
// let $jsonSchema = require('./users-1.mongo');
// !end
// !code: mongo_init // !end

let moduleExports = function (app) {
  let paginate = app.get('paginate');
  let mongoClient = app.get('mongoClient');
  let options = { paginate };
  // !code: mongo_func_init // !end

  // Initialize our service with any options it requires
  app.use('/users-1', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('users-1');

  mongoClient.then(db => {
    return db.createCollection('users-1', {
      // !<DEFAULT> code: mongo_create_collection
      // validator: { $jsonSchema: $jsonSchema },
      // validationLevel: 'strict', // The MongoDB default
      // validationAction: 'error', // The MongoDB default
      // !end
    });
  })
    .then(serviceModel => {
      service.Model = serviceModel;
    });

  service.hooks(hooks);
  // !code: mongo_func_return // !end
};
// !code: mongo_more // !end

// !code: mongo_exports // !end
module.exports = moduleExports;

// !code: mongo_funcs // !end
// !code: mongo_end // !end
