
// Hooks for service `users1`. (Can be re-generated.)
const commonHooks = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;

const {
  hashPassword, protect // eslint-disable-line no-unused-vars
} = require('@feathersjs/authentication-local').hooks;
//!code: imports //!end

//!<DEFAULT> code: used
const { iff } = commonHooks; // eslint-disable-line no-unused-vars
//!end
//!code: init //!end

let moduleExports = {
  before: {
    // Your hooks should include:
    //   find:   authenticate('jwt')
    //   get:    authenticate('jwt')
    //   create: hashPassword()
    //   update: authenticate('jwt') hashPassword()
    //   patch:  authenticate('jwt') hashPassword()
    //   remove: authenticate('jwt')
    //!<DEFAULT> code: before
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [ hashPassword() ],
    update: [ hashPassword(), authenticate('jwt') ],
    patch: [ hashPassword(), authenticate('jwt') ],
    remove: [ authenticate('jwt') ]
    //!end
  },

  after: {
    // Your hooks should include:
    //   all: protect('password')
    //!<DEFAULT> code: after
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
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
