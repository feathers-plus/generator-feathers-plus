
// Configure middleware. (Can be re-generated.)
import { App } from '../app.interface';

import mw1 from './mw-1';
import mw2 from './mw-2';
// !code: imports // !end
// !code: init // !end

// tslint:disable-next-line no-unused-variable
let moduleExports = function (app: App) {
  // !code: func_init // !end
  // Add your custom middleware here. Remember that
  // in Express, the order matters.
  // Your middleware should include:
  //   app.use(mw1());
  //   app.use('mw2', mw2());
  // !<DEFAULT> code: middleware
  app.use(mw1());
  app.use('mw2', mw2());
  // !end
  // !code: func_return // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
