
const deref = require('json-schema-deref-sync');
const merge = require('lodash.merge');
const { join } = require('path');

const doesFileExist = require('./does-file-exist');

module.exports = function serviceSpecsCombine (specs) {
  const baseRefsFolder = join(process.cwd(), specs.app.src, 'refs');
  const specsServices = specs.services || {};
  const feathersSchemas = {};
  const js = specs.options.ts ? 'ts' : 'js';

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

        feathersSchemas[serviceName] = merge({}, derefSchema);
        feathersSchemas[serviceName]._extensions = merge({}, extensions || {});
      }
    } else {
      // This service is currently being added, no files have been persisted yet.
      const defaultGraphqlName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

      feathersSchemas[serviceName] = {
        title: defaultGraphqlName,
        description: `${defaultGraphqlName} database.`,
        _extensions: {}
      };
    }
  });

  // Create GraphQL definitions
  return feathersSchemas;
};
