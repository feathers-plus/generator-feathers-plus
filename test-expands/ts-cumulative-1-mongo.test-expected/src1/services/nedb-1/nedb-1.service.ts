
// Initializes the `nedb1` service on path `/nedb-1`
import { App } from '../../app.interface';

import createService from 'feathers-mongodb';
import hooks from './nedb-1.hooks';
import { Db, MongoClient } from 'mongodb';
// !<DEFAULT> code: imports
// import $jsonSchema from './nedb-1.mongo';
// !end
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app: App) {
  let paginate = app.get('paginate');
  let mongoClient = app.get('mongoClient') as Promise<Db>;
  let options = { paginate };
  // !code: func_init // !end

  // Initialize our service with any options it requires
  app.use('/nedb-1', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-1');

  mongoClient.then(db => {
    return db.createCollection('nedb-1', {
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
