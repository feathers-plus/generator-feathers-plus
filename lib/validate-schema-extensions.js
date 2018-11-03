
const parseGraphqlType = require('./parse-graphql-type');
const validationErrorsLog = require('./validation-errors-log');

const graphqlScalarTypes = ['ID', 'String', 'Int', 'Float', 'Boolean', 'JSON'];

module.exports = validateSchemaExtensions;

// Check each schema.extension
function validateSchemaExtensions(mapping, feathersSchemas) {
  const errors = [];

  // Check each extension.graphql
  Object.keys(feathersSchemas).forEach(schemaName => {
    const feathersExtensions = feathersSchemas[schemaName]._extensions;
    const errLeader = `In schemas.${schemaName}.extension`;

    if (feathersExtensions !== undefined) {
      if (typeof feathersExtensions !== 'object' || feathersExtensions === null) {
        errors.push(`is typeof ${feathersExtensions} not Object. (100)`);
      }

      Object.keys(feathersExtensions).forEach(prop => {
        if (prop !== 'graphql') {
          errors.push(`${errLeader} unexpected property ${prop}. (101)`);
        }
      });

      const graphqlExt = feathersExtensions.graphql;
      if (graphqlExt !== undefined) {
        validateGraphql(mapping, graphqlExt).forEach(str => {
          errors.push(`${errLeader}.graphql${str}`);
        });
      }
    }
  });

  validationErrorsLog('schema.extension validation errors', errors);
  return errors;
}

// Check schema.extension.graphql and each schema.extension.graphql.add
function validateGraphql(mapping, graphqlExt) {
  const errors = [];

  if (typeof graphqlExt !== 'object' || graphqlExt === null) {
    errors.push(`.graphql is typeof ${graphqlExt} not Object. (200)`);
    return errors;
  }

  Object.keys(graphqlExt).forEach(prop => {
    if (!['name', 'service', 'sql', 'discard', 'add'].includes(prop)) {
      errors.push(` unexpected property ${prop}. (201)`);
    }
  });

  if (typeof graphqlExt.name !== 'string') {
    errors.push(`.name is typeof ${graphqlExt.name} not String. (202)`);
  }
  if (typeof graphqlExt.service !== 'object' || graphqlExt.service === null) {
    errors.push(`.service is typeof ${graphqlExt.service} not Object. (203)`);
  }
  if (graphqlExt.sql !== undefined && (typeof graphqlExt.sql !== 'object' || graphqlExt.sql === null)) {
    errors.push(`.sql is typeof ${graphqlExt.sql} not Object. (204)`);
  }
  if (graphqlExt.discard !== undefined && (typeof graphqlExt.discard !== 'object' || graphqlExt.discard === null)) {
    errors.push(`.discard is typeof ${graphqlExt.discard} not Object. {205)`);
  }

  const graphqlAdds = graphqlExt.add;
  if (graphqlAdds !== undefined) {
    if (typeof graphqlExt.add !== 'object' || graphqlExt.add === null) {
      errors.push(`.add is typeof ${graphqlExt.add} not Object. (206)`);
      return errors;
    }

    Object.keys(graphqlAdds).forEach(addName => {
      const graphqlAdd = graphqlAdds[addName];

      validateGraphqlAdd(mapping, graphqlAdd).forEach(str => {
        errors.push(`.add.${addName}${str}`);
      });
    });
  }

  return errors;
}

// Chech one schema.extension.graphql.add property
function validateGraphqlAdd(mapping, graphqlAdd) {
  const errors = [];

  if (typeof graphqlAdd !== 'object' || graphqlAdd === null) {
    errors.push(` is typeof ${graphqlAdd} not Object. (300)`);
    return errors;
  }

  Object.keys(graphqlAdd).forEach(prop => {
    if (!['type', 'args', 'relation'].includes(prop)) {
      errors.push(` unexpected property ${prop}. (301)`);
    }
  });

  if (typeof graphqlAdd.type !== 'string') {
    errors.push(`.type is typeof ${graphqlAdd.name} not String. (302)`);
    return errors;
  }
  if (graphqlAdd.args !== undefined && typeof graphqlAdd.args !== 'boolean' ) {
    errors.push(`.args is typeof ${graphqlAdd.discard} not Boolean. {303)`);
  }

  const { typeName } = parseGraphqlType(graphqlAdd.type);
  const isScalar = graphqlScalarTypes.includes(graphqlAdd.type);

  if (isScalar) {
    if (graphqlAdd.relation !== undefined) {
      errors.push('.relation is not allowed for scalar types. {304)');
    }

    return errors;
  }

  if(!Object.keys(mapping.graphqlService).includes(typeName)) {
    errors.push(` no service has extension.graphql.name of ${typeName}. (305)`);
  }
  if (typeof graphqlAdd.relation !== 'object' || graphqlAdd.relation === null) {
    errors.push(`.relation is typeof ${graphqlAdd.relation} not Object. (306)`);
    return errors;
  }

  const graphqlRelation = graphqlAdd.relation;
  Object.keys(graphqlRelation).forEach(prop => {
    if (!['ourTable', 'otherTable'].includes(prop)) {
      errors.push(`.relation unexpected property ${prop}. (401)`);
    }
  });

  if (typeof graphqlRelation.ourTable !== 'string') {
    errors.push(`.relation.ourTable is typeof ${graphqlRelation.ourTable} not String. (402)`);
  }
  if (typeof graphqlRelation.otherTable !== 'string') {
    errors.push(`.relation.otherTable is typeof ${graphqlRelation.otherTable} not String. (403)`);
  }

  return errors;
}