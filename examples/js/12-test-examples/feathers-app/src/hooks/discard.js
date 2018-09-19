
const _remove = require('feathers-hooks-common/lib/common/_remove');
const { checkContextIf, getItems } = require('feathers-hooks-common');

module.exports = function (...fieldNames) {
  return context => {
    checkContextIf(context, 'before', ['create', 'update', 'patch'], 'discard');

    _remove(getItems(context), fieldNames);

    return context;
  };
};
