
/* eslint quotes: 0 */
// Validation definitions for validateSchema hook for service `nedb1`. (Can be re-generated.)
const { validateSchema } = require('@feathers-plus/feathers-hooks-common');
const merge = require('lodash.merge');
const ajv = require('ajv');
//!code: imports //!end
//!code: init //!end

//!<DEFAULT> code: set_id_type
// eslint-disable-next-line no-unused-vars
const ID = 'string';
//!end

const base = merge({},
  //!<DEFAULT> code: base
  {
    $schema: "http://json-schema.org/draft-05/schema",
    title: "Nedb1",
    description: "Nedb1 database.",
    required: [],
    properties: {
      id: {
        type: ID
      },
      _id: {
        type: ID
      },
      nedb2Id: {
        type: ID
      }
    }
  },
  //!end
  //!code: base_more //!end
);

const create = merge({},
  base,
  //!code: create_more //!end
);

const update = merge({},
  base,
  //!code: update_more //!end
);

const patch = merge({},
  base,
  { required: undefined },
  //!code: patch_more //!end
);

const validateCreate = options => {
  //!<DEFAULT> code: func_create
  return validateSchema(create, ajv, options);
  //!end
};

const validateUpdate = options => {
//!<DEFAULT> code: func_update
  return validateSchema(update, ajv, options);
  //!end
};

const validatePatch = options => {
//!<DEFAULT> code: func_patch
  return validateSchema(patch, ajv, options);
  //!end
};

let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  //!code: moduleExports //!end
};

//!code: exports //!end
module.exports = moduleExports;

//!code: funcs //!end
//!code: end //!end
