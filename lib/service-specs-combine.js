
const deref = require('json-schema-deref-sync');
const deepmerge = require('deepmerge');
const { statSync } = require('fs');
const { join } = require('path');

module.exports = function serviceSpecsCombine(specs) {
  const baseRefsFolder = join(process.cwd(), specs.app.src, 'refs');
  const specsServices = specs.services || {};
  const feathersSchemas = {};

  Object.keys(specsServices).sort().forEach(serviceName => {
    const path = join(process.cwd(), specs.app.src, 'services', serviceName, `${serviceName}.schema`);

    if (fileExists(`${path}.js`)) {
      const { schema, extensions } = require(path);

      if (schema && typeof schema === 'object' && schema !== null && schema.properties ) {
        feathersSchemas[serviceName] = deepmerge(
          {}, deref(schema, { baseFolder: baseRefsFolder, failOnMissing: true })
        );
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
