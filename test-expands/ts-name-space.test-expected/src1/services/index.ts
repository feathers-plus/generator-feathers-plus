
// Configure the Feathers services. (Can be re-generated.)
import { App } from '../app.interface';
import nedb1 from './nedb-1/nedb-1.service';
import nedb2 from './a-1/nedb-2/nedb-2.service';
import nedb3 from './a-1/nedb-3/nedb-3.service';
import nedb4 from './a-1/b-1/nedb-4/nedb-4.service';
import nedb5 from './a-1/b-1/nedb-5/nedb-5.service';
import nedb6 from './c-1/nedb-6/nedb-6.service';

// !code: imports // !end
// !code: init // !end

// tslint:disable-next-line no-unused-variable
let moduleExports = function (app: App) {
  app.configure(nedb1);
  app.configure(nedb2);
  app.configure(nedb3);
  app.configure(nedb4);
  app.configure(nedb5);
  app.configure(nedb6);
  // !code: func_return // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
