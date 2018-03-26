
// Configure the Feathers services. (Can be re-generated.)
import { App } from '../app.interface';
import nedb1 from './nedb-1/nedb-1.service';
import nedb2 from './nedb-2/nedb-2.service';
import users1 from './users-1/users-1.service';

import graphql from './graphql/graphql.service';
// !code: imports // !end
// !code: init // !end

// tslint:disable-next-line no-unused-variable
let moduleExports = function (app: App) {
  app.configure(nedb1);
  app.configure(nedb2);
  app.configure(users1);

  app.configure(graphql);
  // !code: func_return // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
