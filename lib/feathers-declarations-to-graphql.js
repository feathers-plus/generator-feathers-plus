
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

module.exports = function (feathersSchemas, feathersExtensions, specsServices) {
  if (typeof feathersSchemas !== 'object' || feathersSchemas === null) {
    throw new Error(`Expected feathersSchema object. Got ${typeof feathersSchemas}`);
  }

  const fieldSchemas = []; // GraphQL field declarations for every service
  const querySchemas = []; // Default GraphQL CRUD declarations for every service
  const serviceFieldResolvers = {}; // Info for service resolvers for fields in schemas
  const queryResolvers = {}; // Info for service & SQL resolvers for default CRUD declarations
  const sqlFieldMetadata = {}; // SQL metadata for fields in schemas
  const sqlQueryMetadata = {}; // SQL metadata for default CRUD declarations

  const mapping = {
    graphql: {},
    feathers: {},
  };

  // Map Feathers services to GraphQL types
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

  console.log('mapping', mapping);

  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersSchema = feathersSchemas[schemaName] || {};
    const feathersExtension = feathersExtensions[schemaName] || {};

    const graphqlExt = feathersExtension.graphql || {};
    const graphqlName = graphqlExt.name || convertToGraphQLSchemaName(schemaName);
    const added = graphqlExt.add || {};
    const addedFields = Object.keys(added).sort();

    // Both Feathers services and SQL statements
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

    // Feathers services
    if (addedFields.length) {
      const obj = serviceFieldResolvers[graphqlName] = {};

      addedFields.forEach(field => {
        const addedField = added[field];

        const { typeName, isArray } = parseType(addedField.type);
        const serviceName = mapping.graphql[typeName] && mapping.graphql[typeName].service;

        if (addedField) {
          obj[field] = {
            type: addedField.type || DEFAULT_GRAPHQL_TYPE,
            args: convertArgs(addedField.args),
            isArray,
            serviceName,
          };
        }
      });
    }

    const defaultSort = (graphqlExt.service || {}).sort;
    const moreParams = defaultSort ? `, { query: { $sort: ${JSON.stringify(defaultSort)} } }` : '';

    queryResolvers[graphqlName] = {
      schemaName,
      moreParams,
    };

    // SQL statements
    const sqlHeader = graphqlExt.sql;

    if (sqlHeader) {
      const metadata = sqlFieldMetadata[graphqlName] = {};
      metadata.sqlTable = sqlHeader.sqlTable
      metadata.uniqueKey = sqlHeader.uniqueKey

      const sqlColumn = sqlHeader.sqlColumn || {};
      const sqlColumnFields = Object.keys(sqlColumn).sort();
      const metadataFields = metadata.fields = {};

      if (sqlColumnFields.length) {
        sqlColumnFields.forEach(field => {
          metadataFields[field] = { sqlColumn: sqlColumn[field] };
        });
      }

      if (addedFields.length) {
        addedFields.forEach(field => {
          const addedField = added[field];

          if (addedField) {
            metadataFields[field] = addedField.sql;
          }
        });
      }

      sqlQueryMetadata[`get${graphqlName}`] = {
        orderBy: (args, content) => makeOrderBy(args, { uuid: 1 }),
        where: (table, args) => makeWhere(table, args, 'uuid'),
      };

      sqlQueryMetadata[`find${graphqlName}`] = {
        orderBy: (args, content) => makeOrderBy(args, { uuid: 1 }),
        where: (table, args) => makeWhere(table, args, 'uuid'),
      };
    }
  });

  // Return results
  const schemas = [
    fieldSchemas.join(EOL),
    '',
    'type Query {',
    querySchemas.join(EOL),
    '}',
  ].join(EOL);

  const sqlMetadata = Object.assign({}, sqlFieldMetadata, { Query: { fields: sqlQueryMetadata } });

  return {
    schemas, mapping,
    serviceFieldResolvers, serviceQueryResolvers: queryResolvers,
    sqlQueryResolvers: queryResolvers, sqlMetadata,
  };
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
