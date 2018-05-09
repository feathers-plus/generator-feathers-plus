
// Configure the Feathers services. (Can be re-generated.)
import { App } from '../app.interface';
import roles from './roles/roles.service';
import teams from './teams/teams.service';
import users from './users/users.service';

// !code: imports // !end
// !code: init // !end

// tslint:disable-next-line no-unused-variable
let moduleExports = function (app: App) {
  app.configure(roles);
  app.configure(teams);
  app.configure(users);
  // !code: func_return // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
