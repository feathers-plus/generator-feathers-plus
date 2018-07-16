
// Expand Feathers service schemas with derived data which the templates will use

const traverse = require('traverse');
const { camelCase, upperFirst } = require('lodash');
const adapterInfo = require('./adapter-info');
const serviceSpecsCombine = require('./service-specs-combine');
const stringifyPlus = require('./stringify-plus');
const { inspect } = require('util');

const graphqlScalarTypes = ['ID', 'String', 'Int', 'Float', 'Boolean', 'JSON'];
const DEFAULT_GRAPHQL_TYPE = 'String';

const schemaTypeToGraphql = { // eslint-disable-line no-unused-vars
  ID: 'ID', // our extension to JSON-schema
  string: 'String',
  integer: 'Int',
  number: 'Float',
  boolean: 'Boolean',
  object: '*****',
  array: '*****',
  null: 'String' // todo should we throw on encountering this?
};

module.exports = function serviceSpecsExpand (specs) {
  const specsServices = specs.services || {};
  const feathersSchemas = serviceSpecsCombine(specs);

  // Map Feathers service schemas to GraphQL types
  const mapping = { feathers: {}, graphqlService: {}, graphqlSql: {} };

  Object.keys(feathersSchemas).forEach(schemaName => {
    const specsService = specsServices[schemaName] || {};

    if (specsService.graphql) {
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

  // Expand service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    let feathersSchema = feathersSchemas[schemaName];

    // Expand JSON-schema
    feathersSchema.required = feathersSchema.required || [];
    feathersSchema.uniqueItemProperties = feathersSchema.uniqueItemProperties || [];
    feathersSchema.properties = feathersSchema.properties || {};

    feathersSchemas[schemaName] = expandProperties(feathersSchema);
    feathersSchema = feathersSchemas[schemaName];
    const feathersExtensions = feathersSchema._extensions;

    // Expand _extensions.primaryKey
    feathersExtensions.primaryKey = adapterInfo(specs.services[schemaName].adapter);

    // Expand _extensions.foreignKeys
    feathersExtensions.foreignKeys = findForeignKeys(feathersSchema);

    // Expand _extensions.graphql
    feathersExtensions.graphql = feathersExtensions.graphql || {};

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

      const { typeName, isNullable, isArray, isNullableElem } = parseType(addField.type);
      addField.typeName = typeName;
      addField.isScalar = graphqlScalarTypes.indexOf(addField.typeName) !== -1;
      addField.isNullable = isNullable;
      addField.isArray = isArray;
      addField.isNullableElem = isNullableElem;
      // todo need an error message if .serviceName below is undefined
      addField.serviceName = (mapping.graphqlService[typeName] || {}).service;

      addField.relation = addField.relation || {};

      addField.relation.ourTable = addField.relation.ourTable || '__USER_ID__';
      const ourTableProperties =
        (feathersSchemas[schemaName].properties || {})[addField.relation.ourTable] || {};
      addField.relation.ourTableIsArray = (ourTableProperties.type || '').toLowerCase() === 'array';
      addField.relation.ourTableSql =
        graphqlExt.sql.sqlColumn[addField.relation.ourTable] || addField.relation.ourTable;

      if (!addField.isScalar) {
        addField.relation.otherTable = addField.relation.otherTable || '__ID__';
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
    const graphqlAdd = feathersSchemas[schemaName]._extensions.graphql.add;

    Object.keys(graphqlAdd).forEach(field => {
      const addField = graphqlAdd[field];

      if (!addField.isScalar) {
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
      property.items = property.items || [{ type: 'string' }];
      property.items[0] = property.items[0] || { type: 'string' };
      property.items[0].type = (property.items.type || 'string').toLowerCase();
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

function parseType (type) {
  let isNullable = true;
  let isArray = false;
  let isNullableElem = null;

  if (type.substr(-1) === '!') {
    isNullable = false;
    type = type.substr(0, type.length - 1);
  }

  if (type.charAt(0) === '[') {
    isArray = true;
    type = type.substr(1, type.length - 2);

    isNullableElem = true;

    if (type.substr(-1) === '!') {
      isNullableElem = false;
      type = type.substr(0, type.length - 1);
    }
  }

  return { typeName: type, isNullable, isArray, isNullableElem };
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
