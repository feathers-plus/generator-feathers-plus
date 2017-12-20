
const { camelCase, upperFirst } = require('lodash');
const { EOL } = require('os');
const serviceSpecsCombine = require('./service-specs-combine');
const stringifyPlus = require('./stringify-plus');

const graphqlScalarTypes = ['ID', 'String', 'Int', 'Float', 'Boolean', 'JSON'];
const DEFAULT_GRAPHQL_TYPE = 'String';

const schemaTypeToGraphql = {
  ID: 'ID', // our extension to JSON-schema
  string: 'String',
  integer: 'Int',
  number: 'Float',
  boolean: 'Boolean',
  object: '*****',
  array: '*****',
  null: 'String', // todo should we throw on encountering this?
};

module.exports = function serviceSpecsExpand(specs) {
  const specsServices = specs.services || {};
  const feathersSchemas = serviceSpecsCombine(specs);

  const fieldSchemas = []; // GraphQL field declarations for every service
  const querySchemas = []; // Default GraphQL CRUD declarations for every service

  // Map Feathers service schemas to GraphQL types
  const mapping = { graphql: {}, feathers: {} };

  Object.keys(feathersSchemas).forEach(schemaName => {
    const specsServicePath = (specsServices[schemaName] || {}).path || schemaName;

    const feathersExtension = feathersSchemas[schemaName]._extensions;
    feathersExtension.graphql = feathersExtension.graphql || {};
    feathersExtension.graphql.name =
      feathersExtension.graphql.name || convertToGraphQLSchemaName(schemaName);

    mapping.graphql[feathersExtension.graphql.name] = {
      service: schemaName,
      path: specsServicePath,
    };

    mapping.feathers[schemaName] = {
      graphql: feathersExtension.graphql.name,
      path: specsServicePath,
    };
  });

  // Expand service schemas
  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersExtensions = feathersSchemas[schemaName]._extensions;
    feathersExtensions.graphql = feathersExtensions.graphql || {};

    const graphqlExt = feathersExtensions.graphql;
    graphqlExt.service = (graphqlExt.service || {}).sort;
    const pretty = stringifyPlus(graphqlExt.service, { stringifyIndents: 0 }).replace(/\n/g, ' ');
    graphqlExt.serviceSortParams = graphqlExt.service ? `, { query: { $sort: ${pretty} } }` : '';

    graphqlExt.sql = graphqlExt.sql || {};
    graphqlExt.sql.uniqueKey = graphqlExt.sql.uniqueKey || 'id';

    graphqlExt.add = graphqlExt.add || {};

    Object.keys(graphqlExt.add).sort().forEach(field => {
      const addField = graphqlExt.add[field];
      addField.type = addField.type || DEFAULT_GRAPHQL_TYPE;
      addField.args = convertArgs(addField.args);

      addField.relation = addField.relation || {};
      addField.relation.ourTable = addField.relation.ourTable || '__USER_ID__';
      addField.relation.ourTableSql =
        graphqlExt.sql.sqlColumn[addField.relation.ourTable] || addField.relation.ourTable;
      addField.relation.otherTable = addField.relation.otherTable || '__ID__';

      const { typeName, isNullable, isArray, isNullableElem } = parseType(addField.type);
      addField.typeName = typeName;
      addField.isScalar = graphqlScalarTypes.indexOf(addField.typeName) !== -1;
      addField.isNullable = isNullable;
      addField.isArray = isArray;
      addField.isNullableElem = isNullableElem;
      addField.serviceName = (mapping.graphql[typeName] || {}).service;
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
    inspector('feathersSchemas', feathersSchemas);

  });

  /*
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

        const { typeName, isNullable, isArray, isNullableElem } = parseType(addedField.type);
        const serviceName = mapping.graphql[typeName] && mapping.graphql[typeName].service;

        if (addedField) {
          const type = addedField.type || DEFAULT_GRAPHQL_TYPE;
          const relation = addedField.relation || {};
          const relationOurTable = relation.ourTable || '__USER_ID__';
          const relationOtherTable = relation.otherTable || '__ID__';

          obj[field] = {
            type,
            isNullable,
            isArray,
            isNullableElem,
            typeName: type.replace(/[\[!\]]/g,''),
            serviceName,
            args: convertArgs(addedField.args),
            relationOurTable,
            relationOtherTable,
            relationOurTableSql: sqlColumn[relationOurTable] || relationOurTable,
            sqlColumn,
          };
        }
      });
    }

    const uniqueKey = sqlHeader.uniqueKey || 'id';
    const defaultSort = (graphqlExt.service || {}).sort;
    const moreParams = defaultSort ? `, { query: { $sort: ${JSON.stringify(defaultSort)} } }` : '';

    queryInfo[graphqlName] = { schemaName, uniqueKey, moreParams };
  });
  */
/*
  // Return results
  const schemas = [
    fieldSchemas.join(EOL),
    '',
    'type Query {',
    querySchemas.join(EOL),
    '}',
  ].join(EOL);
  */

  return feathersSchemas;
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
    return `${name}: ${array ? '[' : ''}${schemaTypeToGraphql[type.trim()]}${req ? '!' : ''}${array ? ']' : ''}`;
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
function inspector(desc, obj, depth = 7) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
