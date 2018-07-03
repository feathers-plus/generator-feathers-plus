
// Initializes the `nedb3` service on path `/nedb-3`. (Can be re-generated.)
import { App } from '../../../app.interface';

import createService from 'feathers-nedb';
import createModel from '../../../models/a-1/nedb-3.model';
import hooks from './nedb-3.hooks';
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app: App) {
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
  app.use('/nedb-3', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('nedb-3');

  service.hooks(hooks);
  // !code: func_return // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
