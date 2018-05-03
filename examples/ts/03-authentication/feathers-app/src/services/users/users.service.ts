
// Initializes the `users` service on path `/users`
import { App } from '../../app.interface';

import createService from 'feathers-mongodb';
import hooks from './users.hooks';
import { Db, MongoClient } from 'mongodb';
// !<DEFAULT> code: imports
// import $jsonSchema from './users.mongo';
// !end
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app: App) {
  let paginate = app.get('paginate');
  let mongoClient = app.get('mongoClient') as Promise<Db>;
  let options = { paginate };
  // !code: func_init // !end

  // Initialize our service with any options it requires
  app.use('/users', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('users');

  mongoClient.then(db => {
    return db.createCollection('users', {
      // !<DEFAULT> code: create_collection
      // validator: { $jsonSchema: $jsonSchema },
      // validationLevel: 'strict', // The MongoDB default
      // validationAction: 'error', // The MongoDB default
      // !end
    });
  })
    .then(serviceModel => {
      (service as any).Model = serviceModel;
    });

  service.hooks(hooks);
  // !code: func_return // !end
};
// !code: more // !end

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
