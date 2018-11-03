
// Expand Feathers service schemas with derived data which the templates will use

const traverse = require('traverse');
const { camelCase, upperFirst } = require('lodash');
const adapterInfo = require('./adapter-info');
const parseGraphqlType = require('./parse-graphql-type');
const serviceSpecsCombine = require('./service-specs-combine');
const stringifyPlus = require('./stringify-plus');
const validateSchemaExtensions = require('./validate-schema-extensions');
const { inspect } = require('util');

const graphqlScalarTypes = ['ID', 'String', 'Int', 'Float', 'Boolean', 'JSON'];
const DEFAULT_GRAPHQL_TYPE = 'String';

// fakeFeathersSchemas is passed only by the test routines
module.exports = function serviceSpecsExpand (specs, generator, fakeFeathersSchemas) {
  // Update out of date specs
  specs.hooks = specs.hooks || {};

  const specsServices = specs.services || {};
  const feathersSchemas = fakeFeathersSchemas || serviceSpecsCombine(specs, generator);

  // Get hooks by service
  specs._hooks = {};
  Object.keys(specs.hooks).sort().forEach(hookName => {
    const hookSpec = specs.hooks[hookName];

    if (hookSpec.ifMulti !== 'y') {
      const serviceName = hookSpec.singleService;

      specs._hooks[serviceName] = specs._hooks[serviceName] || [];
      specs._hooks[serviceName].push({
        filePath: './hooks/',
        fileName: hookSpec.fileName,
        camelName: hookSpec.camelName,
      });
    } else {
      let multiServices = hookSpec.multiServices;

      if (multiServices.indexOf('*none') !== -1) return;

      if (multiServices.indexOf('*app') !== -1) {
        const serviceName = '*app';
        specs._hooks[serviceName] = specs._hooks[serviceName] || [];

        specs._hooks[serviceName].push({
          filePath: './hooks/',
          fileName: hookSpec.fileName,
          camelName: hookSpec.camelName,
        });

        return;
      }

      multiServices.sort().forEach(serviceName => {
        const serviceSpec = specs.services[serviceName];
        specs._hooks[serviceName] = specs._hooks[serviceName] || [];

        specs._hooks[serviceName].push({
          filePath: `${getNameSpace(serviceSpec.subFolder)[2]}../../hooks/`,
          fileName: hookSpec.fileName,
          camelName: hookSpec.camelName,
        });
      });
    }
  });

  // Map Feathers service schemas to GraphQL types
  const mapping = { feathers: {}, graphqlService: {}, graphqlSql: {} };

  Object.keys(feathersSchemas).forEach(schemaName => {
    const specsService = specsServices[schemaName] || {};

    if (specsService.graphql && feathersSchemas[schemaName]._extensions) {
      const specsServicePath = specsService.path || schemaName;
      const specsAdapter = specsService.adapter;

      const feathersExtension = feathersSchemas[schemaName]._extensions;
      feathersExtension.graphql = feathersExtension.graphql || {};
      feathersExtension.graphql.sql = feathersExtension.graphql.sql || {};
      feathersExtension.graphql.service = feathersExtension.graphql.service || {};
      feathersExtension.graphql.name =
        feathersExtension.graphql.name || convertToGraphQLSchemaName(schemaName);

      mapping.feathers[schemaName] = {
        graphql: feathersExtension.graphql.name,
        path: specsServicePath,
        adapter: specsAdapter,
      };

      if (Object.keys(feathersExtension.graphql.service).length !== 0) {
        mapping.graphqlService[feathersExtension.graphql.name] = {
          service: schemaName,
          path: specsServicePath,
          adapter: specsAdapter,
        };
      }

      if (Object.keys(feathersExtension.graphql.sql).length !== 0) {
        mapping.graphqlSql[feathersExtension.graphql.name] = {
          service: schemaName,
          path: specsServicePath,
          adapter: specsAdapter,
        };
      }
    }
  });

  // Error check all schema.extension
  validateSchemaExtensions(mapping, feathersSchemas);

  // Expand service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    let feathersSchema = feathersSchemas[schemaName];

    // Expand JSON-schema
    feathersSchema.required = feathersSchema.required || [];
    feathersSchema.uniqueItemProperties = feathersSchema.uniqueItemProperties || [];
    feathersSchema.properties = feathersSchema.properties || {};

    feathersSchemas[schemaName] = expandProperties(feathersSchema);
    feathersSchema = feathersSchemas[schemaName];
    feathersSchema._extensions = feathersSchema._extensions || {};
    const feathersExtensions = feathersSchema._extensions;

    // Expand _extensions.primaryKey
    feathersExtensions.primaryKey = adapterInfo(specs.services[schemaName].adapter);

    // Expand _extensions.foreignKeys
    feathersExtensions.foreignKeys = findForeignKeys(feathersSchema);

    // Expand _extensions.graphql
    feathersExtensions.graphql = feathersExtensions.graphql || {};
    feathersExtensions._ifGraphql = specs.services[schemaName].graphql;

    const graphqlExt = feathersExtensions.graphql;
    graphqlExt.service = (graphqlExt.service || {}).sort;
    const pretty = stringifyPlus(graphqlExt.service, { stringifyIndents: 0 }).replace(/\n/g, ' ');
    graphqlExt.serviceSortParams = graphqlExt.service ? `, { query: { $sort: ${pretty} } }` : '';

    graphqlExt.sql = graphqlExt.sql || {};
    graphqlExt.sql.uniqueKey = graphqlExt.sql.uniqueKey || 'id';
    graphqlExt.sql.sqlColumn = graphqlExt.sql.sqlColumn || {};

    graphqlExt.add = graphqlExt.add || {};

    // Expand _extensions.graphql.add
    Object.keys(graphqlExt.add).sort().forEach(field => {
      // console.log('>>>>>',schemaName, field);

      const addField = graphqlExt.add[field];
      addField.type = addField.type || DEFAULT_GRAPHQL_TYPE;
      addField.args = convertArgs(addField.args);

      const { typeName, isNullable, isArray, isNullableElem } = parseGraphqlType(addField.type);
      addField.typeName = typeName;
      addField.isScalar = graphqlScalarTypes.indexOf(addField.typeName) !== -1;
      addField.isNullable = isNullable;
      addField.isArray = isArray;
      addField.isNullableElem = isNullableElem;
      // todo need an error message if .serviceName below is undefined
      addField.serviceName = (mapping.graphqlService[typeName] || {}).service;

      addField.relation = addField.relation || {};

      addField.relation.ourTable = addField.relation.ourTable || '__NO_RELATION_OUR_TABLE__';
      const ourTableProperties =
        (feathersSchemas[schemaName].properties || {})[addField.relation.ourTable] || {};
      addField.relation.ourTableIsArray = (ourTableProperties.type || '').toLowerCase() === 'array';
      addField.relation.ourTableSql =
        graphqlExt.sql.sqlColumn[addField.relation.ourTable] || addField.relation.ourTable;

      if (!addField.isScalar) {
        addField.relation.otherTable = addField.relation.otherTable || '__NO_RELATION_OTHER_TABLE__';
        addField.relation.otherTableName = typeName;
        const otherService =
          mapping.graphqlService[typeName] && mapping.graphqlService[typeName].service;

        if (otherService) {
          addField.relation.otherTableService = otherService;
          addField.relation.otherTableIsArray = !!(
            feathersSchemas[otherService]
            && feathersSchemas[otherService].properties[addField.relation.otherTable]
            && (feathersSchemas[otherService].properties[addField.relation.otherTable].type === 'array')
          );
        }
      }

      // console.log('addField', addField);
    });
  });

  // Add cross-references between service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    const graphqlAdd = ((feathersSchemas[schemaName]._extensions || {}).graphql || {}).add || [];

    Object.keys(graphqlAdd).forEach(field => {
      const addField = graphqlAdd[field];

      // Ignore relation to non-existent service
      if (!addField.isScalar && feathersSchemas[addField.serviceName]) {
        const otherTableSqlColumn =
          feathersSchemas[addField.serviceName]._extensions.graphql.sql.sqlColumn;
        addField.relation.otherTableSql =
          otherTableSqlColumn[addField.relation.otherTable] || addField.relation.otherTable;
      }
    });
  });

  return { mapping, feathersSpecs: feathersSchemas };
};

function convertToGraphQLSchemaName (name) {
  return upperFirst(camelCase(name));
}

function expandProperties (feathersSchema, depth = 1) {
  const properties = feathersSchema.properties;

  function normalizeSchemaArrayElem(propItem) {
    propItem = propItem || { type: 'string' };
    propItem.type = propItem.type || 'string';
    if (propItem.type !== 'ID') {
      propItem.type = propItem.type.toLowerCase();
    }
  }

  Object.keys(properties || {}).forEach(fieldName => {
    let property = properties[fieldName];

    if (!property.type) {
      if (property.properties) {
        property.type = 'object';
      } else if (property.items) {
        property.type = 'array';
      } else {
        property.type = 'string';
      }
    }

    // Handle model for json-schema { type: 'array', items: [] }
    if (property.type === 'array') {
      property.items = property.items || { type: 'string' };

      if (Array.isArray(property.items)) {
        property.items.forEach(propItem => {
          normalizeSchemaArrayElem(propItem);
        });
      } else {
        normalizeSchemaArrayElem(property.items);
      }
    }

    // Handle model for json-schema { type: 'object', properties: {} }
    if (property.type === 'object') {
      properties[fieldName] = expandProperties(property, ++depth);
      property = properties[fieldName];
    }

    // Process every json-schema keyword for field
    Object.keys(property).forEach(() => {});
  });

  return feathersSchema;
}

function findForeignKeys (feathersSchema) {
  const fks = [];

  traverse(feathersSchema.properties).forEach(function(node) {
    if (this.key !== 'type' || node !== 'ID') return;

    // Arrays will have [ name, 'items', index, ... ] somewhere
    const isArray = this.path.some((str, i) => {
      return  str === 'items' && i % 2 !== 0;
    });

    if (!isArray) {
      // Non-array path looks like [ fieldName, 'type' ]
      // or [ name1, 'properties', name2, 'properties', name3, 'type' ]
      const fk = this.path.filter((str, i) => i % 2 === 0);
      fks.push(fk.join('.'));
    }
  });

  return fks;
}

function convertArgs (args) {
  if (typeof args === 'string') return `(${args})`;
  return args === false ? '' : '(query: JSON, params: JSON, key: JSON)';
}

// copy of what's in lib/generator.js
function getNameSpace(subFolder = '') {
  subFolder = subFolder.trim();


  if (subFolder === '') {
    return ['', [], ''];
  }

  const parts = subFolder.split('/');

  if (subFolder.substr(-1) === '/') {
    parts.pop();
  }

  // ['a/b/c', ['a','b','c'], '../../../'] Last elem backs up to root of subFolder.
  return [`${parts.join('/')}/`, parts, '../'.repeat(parts.length)];
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
