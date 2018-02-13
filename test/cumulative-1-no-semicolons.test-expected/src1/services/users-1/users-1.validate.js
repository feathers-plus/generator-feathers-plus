
/* eslint quotes: 0 */
// Validation definitions for validateSchema hook for service `users1`. (Can be re-generated.)
const { validateSchema } = require('feathers-hooks-common')
const merge = require('lodash.merge')
const ajv = require('ajv')
//!code: imports //!end
//!code: init //!end

//!<DEFAULT> code: set_id_type
// eslint-disable-next-line no-unused-vars
const ID = 'string'
//!end

const base = merge({},
  //!<DEFAULT> code: base
  {
    title: "Users1",
    description: "Users1 database.",
    required: [],
    properties: {}
  },
  //!end
  //!code: base_more //!end
)

const create = merge({},
  base,
  //!code: create_more //!end
)

const update = merge({},
  base,
  //!code: update_more //!end
)

const patch = merge({},
  base,
  { required: undefined },
  //!code: patch_more //!end
)

const validateCreate = options => {
  //!<DEFAULT> code: func_create
  return validateSchema(create, ajv, options)
  //!end
}

const validateUpdate = options => {
  //!<DEFAULT> code: func_update
  return validateSchema(update, ajv, options)
  //!end
}

const validatePatch = options => {
  //!<DEFAULT> code: func_patch
  return validateSchema(patch, ajv, options)
  //!end
}

const quickValidate = (method, data, options) => {
  try {
    if (method === 'create') validateCreate(options)({ type: 'before', method: 'create', data })
    if (method === 'update') validateCreate(options)({ type: 'before', method: 'update', data })
    if (method === 'patch') validateCreate(options)({ type: 'before', method: 'patch', data })
  } catch (err) {
    return err
  }
}

let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  quickValidate,
  //!code: moduleExports //!end
}

//!code: exports //!end
module.exports = moduleExports

//!code: funcs //!end
//!code: end //!end
