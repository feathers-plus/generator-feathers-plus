
// Application interface. (Can be re-generated.)
import { Application } from '@feathersjs/express';
import { Nedb1 } from './services/nedb-1/nedb-1.interface';
import { Nedb2 } from './services/nedb-2/nedb-2.interface';
import { Users1 } from './services/users-1/users-1.interface';
// !code: imports // !end
// !code: init // !end

/*
  You can (but don't need to) specify your services' data types in here.
  If you do, TypeScript can infer the return types of service methods.

  example:

  export type App = Application<{users: User}>;

  app.service('users').get(1).then(user => {
    user = 5; // this won't compile, because user is known to be of type User
  });
 */
export type App = Application<{
  'nedb-1': Nedb1,
  'nedb-2': Nedb2,
  'users-1': Users1,
  // !code: moduleExports // !end
}>;
// !code: funcs // !end
// !code: end // !end
