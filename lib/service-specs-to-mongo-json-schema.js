
const discardFields = ['id', '_id'];

module.exports = function serviceSpecsToMongoJsonSchema (feathersSpec, feathersExtension, depth = 1) {
  const properties = feathersSpec.properties || {};
  const mongoProperties = {};

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
        mongoProperty = mongoProperties[name] = Object({}, property);
        mongoProperty.bsonType = property.type === 'ID' ? 'string' : property.type;
        delete mongoProperty.type;
        break;
    }

    /* Our Mongoose models contain no verification information
    if (required.indexOf(name) !== -1 && property.type !== 'object') {
      mongoProperty.required = true;
    }
    */
  });

  return {
    bsonType: 'object',
    required: feathersSpec.required,
    properties: mongoProperties
  };
};
