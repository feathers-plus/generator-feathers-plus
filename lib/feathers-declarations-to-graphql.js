
const { camelCase, upperFirst } = require('lodash');
const { EOL } = require('os');

/*
 Extensions to JSON-schema:

   module.exports.schema = {
     properties: { id: { type: 'Id' } },
   };

   module.exports.decorators = {
     people: {
       graphql: {
         discard: [ 'mass', 'height' ],
         service: {
           sort: { id: 1 },
         },
         add: {
           fullName: { type: 'String!', resolver: parent => `${parent.firstName} ${parent.lastName}},
         }.
       },
     },
   };
 */

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
  const serviceFieldResolvers = {}; // Service resolvers for fields in schemas
  const serviceQueryResolvers = []; // Service resolvers for default CRUD declarations
  const sqlQueryResolvers = []; // SQL resolvers for default CRUD declarations
  const sqlFieldMetadata = {}; // SQL metadata for fields in schemas
  const sqlQueryMetadata = {}; // SQL metadata for default CRUD declarations

  const mapping = {
    graphql: {},
    feathers: {},
  };

  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersSchema = feathersSchemas[schemaName] || {};
    const feathersExtension = feathersExtensions[schemaName] || {};
    const specsService = specsServices[schemaName] || {};

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

    mapping.graphql[graphqlName] = {
      service: schemaName,
      path: specsService.path,
    };

    mapping.feathers[schemaName] = {
      graphql: graphqlName,
      path: specsService.path,
    };

    // Feathers services
    if (addedFields.length) {
      const obj = serviceFieldResolvers[graphqlName] = {};

      addedFields.forEach(field => {
        const addedField = added[field];

        if (addedField) {
          obj[field] = {
            type: addedField.type || DEFAULT_GRAPHQL_TYPE,
            args: convertArgs(addedField.args),
            resolver: addedField.service.resolver || DEFAULT_GRAPHQL_RESOLVER, // todo what if only sql wanted?
          };
        }
      });
    }

    const defaultSort = graphqlExt.service.sort;
    const moreParams = defaultSort ? `, { query: { $sort: ${JSON.stringify(defaultSort)} } }` : '';

    serviceQueryResolvers.push([
      `      // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
      `      get${graphqlName}(parent, args, content, info) {`,
      '        const feathersParams = convertArgsToFeathers(args);',
      `        return options.services.${schemaName}.get(args.key, feathersParams).then(extractFirstItem);`,
      '      },',
      '',
      `      // find${graphqlName}(query: JSON, params: JSON): [${graphqlName}!]`,
      `      find${graphqlName}(parent, args, content, info) {`,
      `        const feathersParams = convertArgsToFeathers(args${moreParams});`,
      `        return options.services.${schemaName}.find(feathersParams).then(extractAllItems);`,
      '      },',
    ].join(EOL));

    // SQL statements
    const sqlHeader = graphqlExt.sql;

    if (sqlHeader) {
      sqlQueryResolvers.push([
        `      // get${graphqlName}(query: JSON, params: JSON, key: JSON): ${graphqlName}`,
        `      get${graphqlName}: (parent, args, content, info) => genRunSql(content, info),`,
        `      // find${graphqlName}(query: JSON, params: JSON, key: JSON): [${graphqlName}!]`,
        `      find${graphqlName}: (parent, args, content, info) => genRunSql(content, info),`,
      ].join(EOL));

      // do sql column renames
/*
  const fieldSqlMetadata = []; // SQL metadata for fields in schemas
      const metadata = sqlFieldMetadata[graphqlName] = { rest: '', sqlColumn: '', added: {} };

      metadata.rest = [
        `  sqlTable: '${sqlHeader.sqlTable || graphqlExt.name}',`,
        `  uniqueKey: '${sqlHeader.uniqueKey || 'id'}',`,
      ].join(EOL);

      if (sqlColumnFields.length) {
        metadata.sqlColumn = sqlColumnFields.map(
          field => `${field}: { sqlColumn: '${sqlColumn[field]}' },`
        ).join(EOL);
      }

      if (addedFields.length) {
        addedFields.forEach(field => {
          const addedField = added[field].sql;

          if (addedField) {
            metadata.added[field] = Object.keys(addedField).map(
              name => `${name}: ${addedField[name].toString()},`
            ).join(EOL);
          }
        });
      }

      inspector('>>>>sqlFieldMetadata', sqlFieldMetadata[graphqlName]);

      console.log('>>>>sqlFieldMetadata.rest');
      console.log(sqlFieldMetadata[graphqlName].rest);
      console.log('>>>>sqlFieldMetadata.sqlColumn');
      console.log(sqlFieldMetadata[graphqlName].sqlColumn);
      console.log('>>>>sqlFieldMetadata.added');
      console.log(sqlFieldMetadata[graphqlName].added);
*/

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
            console.log('1', field, addedField.sql);
          }
        });
      }

      sqlQueryMetadata[schemaName] = {
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
    serviceFieldResolvers, serviceQueryResolvers: serviceQueryResolvers.join(EOL),
    sqlQueryResolvers: sqlQueryResolvers.join(EOL), sqlMetadata,
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

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
