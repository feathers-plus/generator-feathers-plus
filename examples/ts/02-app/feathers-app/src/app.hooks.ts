
// Application hooks that run for every service. (Can be re-generated.)
import { HookMap, HooksObject } from '@feathersjs/feathers';
import * as commonHooks from 'feathers-hooks-common';
// !<DEFAULT> code: imports
import logger from './hooks/logger';
// !end

// !<DEFAULT> code: used
// tslint:disable-next-line no-unused-variable
const { iff } = commonHooks;
// !end
// !code: init // !end

let moduleExports: HooksObject = {
  before: {
    // !<DEFAULT> code: before
    all: [ logger() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },

  after: {
    // !<DEFAULT> code: after
    all: [ logger() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },

  error: {
    // !<DEFAULT> code: error
    all: [ logger() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },
  // !code: moduleExports // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
