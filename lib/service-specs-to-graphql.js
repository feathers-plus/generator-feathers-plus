
const EOL = '\n';

const schemaTypeToGraphql = {
  // todo id: 'ID', // our extension to JSON-schema
  ID: 'ID', // our extension to JSON-schema
  string: 'String',
  integer: 'Int',
  number: 'Float',
  boolean: 'Boolean',
  object: '*****',
  array: '*****',
  null: 'String' // todo should we throw on encountering this?
};

module.exports = function serviceSpecsToGraphql (feathersSchemas) {
  const fieldSchemas = []; // GraphQL field declarations for every service
  const querySchemas = []; // Default GraphQL CRUD declarations for every service

  Object.keys(feathersSchemas).forEach(schemaName => {
    const graphqlExt = feathersSchemas[schemaName]._extensions.graphql;

    const add = graphqlExt.add;
    const graphqlName = graphqlExt.name;

    if (!graphqlName || (!graphqlExt.service && !graphqlExt.sql)) return;

    fieldSchemas.push([
      `type ${graphqlName} {`,
      feathersSchemaToGraphqlSchema(feathersSchemas[schemaName], feathersSchemas[schemaName]._extensions),
      Object.keys(add).map(field =>
        `  ${field}${add[field].args}: ${add[field].type}`
      ).join(EOL),
      '}',
      ' '
    ].filter(str => str).join(EOL));

    querySchemas.push([
      `  get${graphqlName}(key: JSON, query: JSON, params: JSON): ${graphqlName}`,
      `  find${graphqlName}(query: JSON, params: JSON): [${graphqlName}]!`
    ].join(EOL));
  });

  // Return results
  return [
    fieldSchemas.join(EOL),
    '',
    'type Query {',
    querySchemas.join(EOL),
    '}'
  ].join(EOL);
};

// Convert the single Feathers schema { properties: {...}, ... }
function feathersSchemaToGraphqlSchema (feathersSchema, feathersExtension, depth = 1) {
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
        `${leader}}`
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
