
const { camelCase, upperFirst } = require('lodash');
const { EOL } = require('os');

const DEFAULT_GRAPHQL_TYPE = 'String';
const DEFAULT_GRAPHQL_RESOLVER = () => null;

const typeConvert = {
  ID: 'ID', // our extension to JSON-schema
  string: 'String',
  integer: 'Int',
  number: 'Float',
  boolean: 'Boolean',
  object: '*****',
  array: '*****',
  null: 'String', // todo should we throw on encountering this?
};

module.exports = function feathersDeclarationsToGraphql(feathersSchemas, feathersExtensions, specsServices) {
  if (typeof feathersSchemas !== 'object' || feathersSchemas === null) {
    throw new Error(`Expected feathersSchema object. Got ${typeof feathersSchemas}`);
  }

  const fieldSchemas = []; // GraphQL field declarations for every service
  const querySchemas = []; // Default GraphQL CRUD declarations for every service
  const fieldInfo = {}; // Info for schema fields
  const queryInfo = {}; // Info for fields in Query

  // Map Feathers service schemas to GraphQL types
  const mapping = { graphql: {}, feathers: {} };

  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersExtension = feathersExtensions[schemaName] || {};
    const specsService = specsServices[schemaName] || {};
    const graphqlExt = feathersExtension.graphql || {};
    const graphqlName = graphqlExt.name || convertToGraphQLSchemaName(schemaName);

    mapping.graphql[graphqlName] = {
      service: schemaName,
      path: specsService.path,
    };

    mapping.feathers[schemaName] = {
      graphql: graphqlName,
      path: specsService.path,
    };
  });

  // Get generation info from Feathers service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersSchema = feathersSchemas[schemaName] || {};
    const feathersExtension = feathersExtensions[schemaName] || {};

    const graphqlExt = feathersExtension.graphql || {};
    const graphqlName = graphqlExt.name || convertToGraphQLSchemaName(schemaName);
    const added = graphqlExt.add || {};
    const addedFields = Object.keys(added).sort();
    const sqlHeader = graphqlExt.sql || {};
    const sqlColumn = sqlHeader.sqlColumn || {};
    const sqlColumnFields = Object.keys(sqlColumn).sort();

    fieldSchemas.push([
      `type ${graphqlName} {`,
      feathersSchemaToGraphqlSchema(feathersSchema, feathersExtension),
      Object.keys(added).map(field =>
        `  ${field}${convertArgs(added[field].args)}: ${added[field].type || DEFAULT_GRAPHQL_TYPE}`
      ).join(EOL),
      '}',
      ' ',
    ].filter(str => str).join(EOL));

    querySchemas.push([
      `  get${graphqlName}(key: JSON, query: JSON, params: JSON): ${graphqlName}`,
      `  find${graphqlName}(query: JSON, params: JSON): [${graphqlName}]!`,
    ].join(EOL));

    if (addedFields.length) {
      const obj1 = fieldInfo[graphqlName] = {
        // Needed for both Feathers services and SQL statements
        fields: {},
        // Needed for SQL statements
        sqlTable: sqlHeader.sqlTable,
        uniqueKey: sqlHeader.uniqueKey,
        sqlColumn: {},
      };
      const obj = obj1.fields;

      sqlColumnFields.forEach(field => {
        obj1.sqlColumn[field] = sqlColumn[field];
      });

      addedFields.forEach(field => {
        const addedField = added[field];

        const { typeName, isNullable, isArray } = parseType(addedField.type);
        const serviceName = mapping.graphql[typeName] && mapping.graphql[typeName].service;

        if (addedField) {
          const relation = addedField.relation || {};

          obj[field] = {
            type: addedField.type || DEFAULT_GRAPHQL_TYPE,
            args: convertArgs(addedField.args),
            relationOurTable: relation.ourTable || '__USER_ID__',
            relationOtherTable: relation.otherTable || '__ID__',
            isNullable,
            isArray,
            serviceName,
          };
        }
      });
    }

    const defaultSort = (graphqlExt.service || {}).sort;
    const moreParams = defaultSort ? `, { query: { $sort: ${JSON.stringify(defaultSort)} } }` : '';

    queryInfo[graphqlName] = { schemaName, moreParams };
  });

  // Return results
  const schemas = [
    fieldSchemas.join(EOL),
    '',
    'type Query {',
    querySchemas.join(EOL),
    '}',
  ].join(EOL);

  return { feathersSchemas, schemas, mapping, fieldInfo, queryInfo };
};

// Convert the single Feathers schema {properties:{...},...}
function feathersSchemaToGraphqlSchema(feathersSchema, feathersExtension, depth = 1) {
  const leader = '  '.repeat(depth);
  const required = feathersSchema.required || [];
  const properties = feathersSchema.properties || {};
  const graphqlDiscard = (feathersExtension.graphql || {}).discard || [];

  const graphqlTypes = Object.keys(properties).map(name => {
    // Handle names discarded for GraphQL
    if (graphqlDiscard.indexOf(name) !== -1) return '';

    const property = properties[name];
    const req = required.indexOf(name) !== -1;

    let type = property.type || 'string';
    let array = false;

    // Handle nested object address: { type: 'object', required: [...], properties: {...} }
    if (type === 'object') {
      return [
        `${name}: {`,
        feathersSchemaToGraphqlSchema(property, feathersExtension, ++depth),
        `${leader}}`,
      ].join(EOL);
    }

    // Handle array of properties
    if (type === 'array') {
      const items = property.items || { type: 'string' };

      if (typeof items === 'object') {
        type = items.type || 'string';
        array = true;
      } else {
        throw new Error(`Property "${name}" is an array with an invalid "items".`);
      }
    }

    // Handle simple property
    return `${name}: ${array ? '[' : ''}${typeConvert[type.trim()]}${req ? '!' : ''}${array ? ']' : ''}`;
  });

  return leader + graphqlTypes.filter(prop => prop).join(`${EOL}${leader}`);
}

function convertToGraphQLSchemaName(name) {
  return upperFirst(camelCase(name));
}

function convertArgs(args) {
  if (typeof args === 'string') return `(${args})`;
  return args === false ? '' : '(query: JSON, params: JSON, key: JSON)';
}

function parseType(type) {
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
function inspector(desc, obj, depth = 5) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
