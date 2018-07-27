
// Hooks for service `nedb1`. (Can be re-generated.)
const commonHooks = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { ObjectID } = require('mongodb');
// !code: imports // !end

// !<DEFAULT> code: used
// eslint-disable-next-line no-unused-vars
const { iff, mongoKeys } = commonHooks;
// !end
// !<DEFAULT> code: foreign_keys
// eslint-disable-next-line no-unused-vars
const foreignKeys = [
  'id',
  '_id',
  'nedb2Id'
];
// !end
// !code: init // !end

let moduleExports = {
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
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
