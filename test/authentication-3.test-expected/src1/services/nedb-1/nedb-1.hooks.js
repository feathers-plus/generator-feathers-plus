
// Hooks for service `nedb1`. (Can be re-generated.)
const commonHooks = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;

//!code: imports //!end

//!<DEFAULT> code: used
const { iff } = commonHooks; // eslint-disable-line no-unused-vars
//!end
//!code: init //!end

let moduleExports = {
  before: {
    // Your hooks should include:
    // all: authenticate('jwt')
    //!<DEFAULT> code: before
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    //!end
  },

  after: {
    //!<DEFAULT> code: after
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    //!end
  },

  error: {
    //!<DEFAULT> code: error
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    //!end
  },
  //!code: moduleExports //!end
};

//!code: exports //!end
module.exports = moduleExports;

//!code: funcs //!end
//!code: end //!end
