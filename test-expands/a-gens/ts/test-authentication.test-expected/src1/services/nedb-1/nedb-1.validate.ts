
/* tslint:disable:quotemark */
// Validation definitions for validateSchema hook for service `nedb1`. (Can be re-generated.)
import { validateSchema } from 'feathers-hooks-common';
import merge from 'lodash.merge';
import ajv from 'ajv';
// !code: imports // !end
// !code: init // !end

// !<DEFAULT> code: set_id_type
// tslint:disable-next-line:no-unused-variable
const ID = 'string';
// !end

let base = merge({},
  // !<DEFAULT> code: base
  {
    title: "Nedb1",
    description: "Nedb1 database.",
    required: [],
    uniqueItemProperties: [],
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
  // !end
  // !code: base_more // !end
);
// !code: base_change // !end

let create = merge({},
  base,
  // !code: create_more // !end
);

let update = merge({},
  base,
  // !code: update_more // !end
);

let patch = merge({},
  base,
  // !code: patch_more // !end
);
delete patch.required;
// !code: all_change // !end

let validateCreate = (options?: any) => {
  // !<DEFAULT> code: func_create
  return validateSchema(create, ajv, options);
  // !end
};

let validateUpdate = (options?: any) => {
  // !<DEFAULT> code: func_update
  return validateSchema(update, ajv, options);
  // !end
};

let validatePatch = (options?: any) => {
  // !<DEFAULT> code: func_patch
  return validateSchema(patch, ajv, options);
  // !end
};

let quickValidate = (method: string, data: any, options?: any) => {
  try {
    if (method === 'create') { validateCreate(options)({ type: 'before', method: 'create', data } as any); }
    if (method === 'update') { validateCreate(options)({ type: 'before', method: 'update', data } as any); }
    if (method === 'patch') { validateCreate(options)({ type: 'before', method: 'patch', data } as any); }
  } catch (err) {
    return err;
  }
};
// !code: validate_change // !end

// tslint:disable:trailing-comma
let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  quickValidate,
  // !code: moduleExports // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
