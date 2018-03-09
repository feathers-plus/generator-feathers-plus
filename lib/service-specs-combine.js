
const deref = require('json-schema-deref-sync');
const merge = require('lodash.merge');
const { getFragment } = require('./code-fragments');
const { join } = require('path');

const doesFileExist = require('./does-file-exist');

module.exports = function serviceSpecsCombine (specs) {
  const baseRefsFolder = join(process.cwd(), specs.app.src, 'refs');
  const specsServices = specs.services || {};
  const feathersSchemas = {};

  Object.keys(specsServices).sort().forEach(serviceName => {
    const defaultGraphqlName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

    // Select .js or .ts schema file.
    const fileName = specsServices[serviceName].fileName;
    const path = join(process.cwd(), specs.app.src, 'services', fileName, `${fileName}.schema`);

    let schemaFile = `${path}.${specs.options.ts ? 'ts' : 'js'}`;
    if (!doesFileExist(schemaFile)) {
      schemaFile = `${path}.${specs.options.ts ? 'js' : 'ts'}`;
      if (!doesFileExist(schemaFile)) {
        schemaFile = null;
      }
    }

    if (schemaFile) {
      const getFragmenter = getFragment(schemaFile.replace(/\.(js|ts)$/, '.**'));

      // Recreate the `schema` ans `extension` objects in the module
      const schemaStr = [].concat(
        'return {',
           getFragmenter('schema_header') || [
             `title: '${defaultGraphqlName}',`,
             `description: '${defaultGraphqlName} database.',`
           ],
           getFragmenter('schema_definitions'),
        '  required: [',
             getFragmenter('schema_required'),
        '  ],',
        '  uniqueItemProperties: [',
             getFragmenter('schema_unique'),
        '  ],',
        '  properties: {',
             getFragmenter('schema_properties'),
        '  }',
           getFragmenter('schema_more'),
        '}'
      );

      const extensionsStr = [].concat(
        'return {',
        '  graphql: {',
             getFragmenter('graphql_header'),
        '    discard: [',
               getFragmenter('graphql_discard'),
        '    ],',
        '    add: {',
               getFragmenter('graphql_add'),
        '    },',
             getFragmenter('graphql_move'),
        '  }',
        '}'
      );

      let schema, extensions;
      try {
        schema = new Function(schemaStr.join('\n'))();
      } catch (err) {
        console.log(`Syntax error in ${path}. Cannot parse ${schemaStr.join('\n')}`);
        throw err;
      }

      try {
        extensions = new Function(extensionsStr.join('\n'))();
      } catch (err) {
        console.log(`Syntax error in ${path}. Cannot parse ${extensionsStr.join('\n')}`);
        throw err;
      }

      /*
      console.log('extensions 1', extensions);
      const qq = require(path);
      schema = qq.schema;
      extensions = qq.extensions;
      console.log('extensions 2', extensions);
      */

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
