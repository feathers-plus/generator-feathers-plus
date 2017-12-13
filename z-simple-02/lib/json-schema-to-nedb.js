
// Should turn this into its own repo

const _ = require('underscore');
const mongoose = require('mongoose');

// Convert the single Feathers schema {properties:{...},...}
function feathersSchemaToNeDB(feathersSchema, feathersExtension, depth = 1) {
  const properties = feathersSchema.properties || {};
  let nedbSchema = '';

  Object.keys(properties).forEach(name => {
    const property = properties[name];
    let fragment = name;

    if ((property.type || 'string').toLowerCase() === 'object' && typeof property.properties === 'object') {
      fragment = feathersSchemaToNeDB(property, {}, ++depth);
    }

    nedbSchema += `${nedbSchema.length ? ', ' : ''}${fragment}`

  });

  return `{ ${nedbSchema} }`;
}

module.exports = {
  convert: feathersSchemaToNeDB,
};
