
const discardFields = ['id'];

module.exports = function serviceSpecsToMongoJsonSchema (feathersSpec, feathersExtension, depth = 1) {
  const required = feathersSpec.required || [];
  const properties = feathersSpec.properties || {};
  const mongoProperties = {
    _id: { // An _id property in name.schema.js can add properties to this
      bsonType: 'objectId',
    },
  };

  const schemaTypesToMongo = {
    ID: 'objectId',
    integer: 'int',
  };

  Object.keys(properties).forEach(name => {
    if (discardFields.indexOf(name) !== -1) return;

    const property = properties[name];
    let mongoProperty = mongoProperties[name] = {};

    switch (property.type) {
      case 'object':
        mongoProperties[name] = serviceSpecsToMongoJsonSchema(property, feathersExtension, ++depth);
        mongoProperty = mongoProperties[name];
        break;
      default:
        mongoProperty = mongoProperties[name] = Object.assign({}, property);
        mongoProperty.bsonType = schemaTypesToMongo[property.type] || property.type;
        delete mongoProperty.type;
        break;
    }
  });

  return {
    bsonType: 'object',
    additionalProperties: feathersSpec.additionalProperties || false,
    required: feathersSpec.required,
    properties: mongoProperties
  };
};
