
// Define valiation definition for validateSchema hook for service `<%= name %>`.
const { validateSchema } = require('@feathers-plus/feathers-hooks-common');
const deepMerge = require('deepmerge');
const ajv = require('ajv');
<%- insertFragment('imports') %>
<%- insertFragment('init') %>

const base = deepMerge.all([{},
  <%- insertFragment('base', stringifyPlus(schema).split('\n').map(str => `  ${str}`).join('\n') + ',') %>
  <%- insertFragment('base_more') %>
]);

const create = deepMerge.all([{},
  base,
  <%- insertFragment('create_more') %>
]);

const update = deepMerge.all([{},
  base,
  <%- insertFragment('update_more') %>
]);

const patch = deepMerge.all([{},
  base,
  { required: undefined },
  <%- insertFragment('patch_more') %>
]);

const validateCreate = options => {
  <%- insertFragment('func_create', [
    '  return validateSchema(create, ajv, options);',
  ]) %>
};

const validateUpdate = options => {
<%- insertFragment('func_update', [
    '  return validateSchema(update, ajv, options);',
  ]) %>
};

const validatePatch = options => {
<%- insertFragment('func_patch', [
    '  return validateSchema(patch, ajv, options);',
  ]) %>
};

let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  <%- insertFragment('moduleExports') %>
};

<%- insertFragment('exports') %>
module.exports = moduleExports;

<%- insertFragment('funcs') %>
<%- insertFragment('end') %>
