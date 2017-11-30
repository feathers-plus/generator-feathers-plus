
const { statSync } = require('fs');
const { join } = require('path');
const feathersDeclarationsToGraphql = require('./feathers-declarations-to-graphql');

// Construct declarations combining all Feathers services
module.exports = function (specs) {
  const specsServices = specs.services || {};
  const schemas = {};
  const extensions = {};

  Object.keys(specsServices).sort().forEach(serviceName => {
    if (specsServices[serviceName].graphql) {
      const path = join(process.cwd(), specs.app.src, 'services', serviceName, `${serviceName}.schema`);

      if (fileExists(`${path}.js`)) {
        const { schema, extension } = require(path);

        if (schema && typeof schema === 'object' && schema !== null && schema.properties
          && specsServices[serviceName].graphql
        ) {
          schemas[serviceName] = schema;
          if (extension) extensions[serviceName] = extension || {};
        }
      }
    }
  });

  // Create GraphQL definitions
  return feathersDeclarationsToGraphql(schemas, extensions, specsServices || {});
};

function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }
}
