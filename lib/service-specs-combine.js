
const deref = require('json-schema-deref-sync');
const deepmerge = require('deepmerge');
const { join } = require('path');

const doesFileExist = require('./does-file-exist');

module.exports = function serviceSpecsCombine (specs) {
  const baseRefsFolder = join(process.cwd(), specs.app.src, 'refs');
  const specsServices = specs.services || {};
  const feathersSchemas = {};

  Object.keys(specsServices).sort().forEach(serviceName => {
    const fileName = specsServices[serviceName].fileName;
    const path = join(process.cwd(), specs.app.src, 'services', fileName, `${fileName}.schema`);

    if (doesFileExist(`${path}.js`)) {
      const { schema, extensions } = require(path);

      if (typeof schema === 'object' && schema !== null) {
        let derefSchema = deref(schema, { baseFolder: baseRefsFolder, failOnMissing: true });

        if (derefSchema instanceof Error) {
          // todo error message required
          derefSchema = schema; // hack: how we handle a de-ref error
        } else {
          delete derefSchema.definitions;
        }

        feathersSchemas[serviceName] = deepmerge({}, derefSchema);
        feathersSchemas[serviceName]._extensions = deepmerge({}, extensions || {});
      }
    } else {
      // This service is currently being added, no files have been persisted yet.
      const defaultGraphqlName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

      feathersSchemas[serviceName] = {
        $schema: 'http://json-schema.org/draft-05/schema',
        title: defaultGraphqlName,
        description: `${defaultGraphqlName} database.`,
        _extensions: {}
      };
    }
  });

  // Create GraphQL definitions
  return feathersSchemas;
};
