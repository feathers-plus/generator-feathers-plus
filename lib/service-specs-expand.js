
// Expand Feathers service schemas with derived data which the templates will use

const { camelCase, upperFirst } = require('lodash');
const serviceSpecsCombine = require('./service-specs-combine');
const stringifyPlus = require('./stringify-plus');

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
      const specsServicePath = (specsService || {}).path || schemaName;

      const feathersExtension = feathersSchemas[schemaName]._extensions;
      feathersExtension.graphql = feathersExtension.graphql || {};
      feathersExtension.graphql.sql = feathersExtension.graphql.sql || {};
      feathersExtension.graphql.service = feathersExtension.graphql.service || {};
      feathersExtension.graphql.name =
        feathersExtension.graphql.name || convertToGraphQLSchemaName(schemaName);

      mapping.feathers[schemaName] = {
        graphql: feathersExtension.graphql.name,
        path: specsServicePath
      };

      if (Object.keys(feathersExtension.graphql.service).length !== 0) {
        mapping.graphqlService[feathersExtension.graphql.name] = {
          service: schemaName,
          path: specsServicePath
        };
      }

      if (Object.keys(feathersExtension.graphql.sql).length !== 0) {
        mapping.graphqlSql[feathersExtension.graphql.name] = {
          service: schemaName,
          path: specsServicePath
        };
      }
    }
  });

  // Expand service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    let feathersSchema = feathersSchemas[schemaName];

    // Expand JSON-schema
    feathersSchema.required = feathersSchema.required || [];
    feathersSchema.properties = feathersSchema.properties || {};

    feathersSchemas[schemaName] = expandProperties(feathersSchema);
    feathersSchema = feathersSchemas[schemaName];

    // Expand _extensions
    const feathersExtensions = feathersSchema._extensions;
    feathersExtensions.graphql = feathersExtensions.graphql || {};

    const graphqlExt = feathersExtensions.graphql;
    graphqlExt.service = (graphqlExt.service || {}).sort;
    const pretty = stringifyPlus(graphqlExt.service, { stringifyIndents: 0 }).replace(/\n/g, ' ');
    graphqlExt.serviceSortParams = graphqlExt.service ? `, { query: { $sort: ${pretty} } }` : '';

    graphqlExt.sql = graphqlExt.sql || {};
    graphqlExt.sql.uniqueKey = graphqlExt.sql.uniqueKey || 'id';
    graphqlExt.sql.sqlColumn = graphqlExt.sql.sqlColumn || {};

    graphqlExt.add = graphqlExt.add || {};

    // Expand _extensions.add
    Object.keys(graphqlExt.add).sort().forEach(field => {
      const addField = graphqlExt.add[field];
      addField.type = addField.type || DEFAULT_GRAPHQL_TYPE;
      addField.args = convertArgs(addField.args);

      addField.relation = addField.relation || {};
      addField.relation.ourTable = addField.relation.ourTable || '__USER_ID__';
      const ourTableProperties =
        (feathersSchemas[schemaName].properties || {})[addField.relation.ourTable] || {};
      addField.relation.ourTableIsArray = (ourTableProperties.type || '').toLowerCase() === 'array';
      addField.relation.ourTableSql =
        graphqlExt.sql.sqlColumn[addField.relation.ourTable] || addField.relation.ourTable;
      addField.relation.otherTable = addField.relation.otherTable || '__ID__';

      const { typeName, isNullable, isArray, isNullableElem } = parseType(addField.type);
      addField.typeName = typeName;
      addField.isScalar = graphqlScalarTypes.indexOf(addField.typeName) !== -1;
      addField.isNullable = isNullable;
      addField.isArray = isArray;
      addField.isNullableElem = isNullableElem;
      // todo need an error msh if .serviceName below is undefined
      addField.serviceName = (mapping.graphqlService[typeName] || {}).service;
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

function expandProperties (feathersSchema, depth = 1) {
  const properties = feathersSchema.properties;

  Object.keys(properties || {}).forEach(fieldName => {
    let property = properties[fieldName];

    if (!property.type && depth !== 1) {
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
    if (property.type === 'object' || depth === 1) {
      properties[fieldName] = expandProperties(property, ++depth);
      property = properties[fieldName];
    }

    // Process every json-schema keyword for field
    Object.keys(property).forEach(keyword => {});
  });

  return feathersSchema;
}

function convertToGraphQLSchemaName (name) {
  return upperFirst(camelCase(name));
}

function convertArgs (args) {
  if (typeof args === 'string') return `(${args})`;
  return args === false ? '' : '(query: JSON, params: JSON, key: JSON)';
}

function parseType (type) {
  let isNullable = true;
  let isArray = false;
  let isNullableElem = null;
  let typeName;

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

const { inspect } = require('util');
function inspector (desc, obj, depth = 7) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
