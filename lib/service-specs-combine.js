
const deref = require('json-schema-deref-sync');
const deepmerge = require('deepmerge');
const { statSync } = require('fs');
const { join } = require('path');

module.exports = function serviceSpecsCombine(specs) {
  const baseRefsFolder = join(process.cwd(), specs.app.src, 'json-schema');
  const specsServices = specs.services || {};
  const feathersSchemas = {};

  Object.keys(specsServices).sort().forEach(serviceName => {
    console.log('serviceName', serviceName);

    const fileName = specsServices[serviceName].fileName || serviceName; // todo || serviceName is temporary
    const path = join(process.cwd(), specs.app.src, 'services', fileName, `${fileName}.schema`);

    if (fileExists(`${path}.js`)) {
      const { schema, extensions } = require(path);

      if (typeof schema === 'object' && schema !== null ) {
        const derefSchema = deref(schema, { baseFolder: baseRefsFolder, failOnMissing: true });
        delete derefSchema.definitions;

        if (serviceName === 'zRef1') inspector('derefSchema', derefSchema)

        feathersSchemas[serviceName] = deepmerge({}, derefSchema);
        feathersSchemas[serviceName]._extensions = deepmerge({}, extensions || {});
      }
    }
  });

  // Create GraphQL definitions
  return feathersSchemas;
};

function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }
}

const { inspect } = require('util');
function inspector(desc, obj, depth = 7) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
