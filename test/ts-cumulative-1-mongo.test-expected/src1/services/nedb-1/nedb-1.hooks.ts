
// Hooks for service `nedb1`. (Can be re-generated.)
import * as commonHooks from 'feathers-hooks-common';
import { HooksObject } from '@feathersjs/feathers';
import { hooks as authHooks } from '@feathersjs/authentication';
const { authenticate } = authHooks;
import { ObjectID } from 'mongodb';
// !code: imports // !end

// !<DEFAULT> code: used
// tslint:disable-next-line no-unused-variable
const { iff, mongoKeys } = commonHooks;
// !end
// !<DEFAULT> code: foreign_keys
// tslint:disable-next-line no-unused-variable
const foreignKeys: string | string[] = [
  'id',
  '_id',
  'nedb2Id'
];
// !end
// !code: init // !end

let moduleExports: HooksObject = {
  before: {
    // Your hooks should include:
    //   all   : authenticate('jwt')
    //   find  : mongoKeys(ObjectID, foreignKeys)
    // !<DEFAULT> code: before
    all: [ authenticate('jwt') ],
    find: [ mongoKeys(ObjectID, foreignKeys) ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },

  after: {
    // !<DEFAULT> code: after
    all: [],
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
    all: [],
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
