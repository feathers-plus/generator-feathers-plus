
const EOL = '\n';

module.exports = function serviceSpecsToTypescript (specsService, feathersSpec, feathersExtension, depth = 1) {
  const properties = feathersSpec.properties || {};
  const typescriptTypes = [];
  const typescriptExtends = [];

  const { idName, idType } = feathersExtension.primaryKey;

  const schemaTypesToTypeScript = {
    ID: idType,
    integer: 'number',
  };
  const primitiveArrayTypes = ['string', 'number', 'boolean'];

  Object.keys(properties).forEach(name => {
    const property = properties[name];
    if (name !== idName && (name === 'id' || name === '_id')) return;

    let subTypes, subTypesStr, arrayElementType;
    switch (property.type) {
      case 'array':
        if (primitiveArrayTypes.includes(property.items.type)) {
          arrayElementType = property.items.type;
        } else {
          arrayElementType = (property.items.type === 'ID' || property.items.type === idName)
            ? idType
            : 'any';
        }

        typescriptTypes.push(`${name}: ${arrayElementType}[]`);
        break;
      case 'object':
        subTypes = serviceSpecsToTypescript(specsService, property, feathersExtension, ++depth);
        subTypesStr = subTypes.typescriptTypes.map(str => `  ${str}`).join(`;${EOL}`);
        typescriptTypes.push(`${name}: {${EOL}${subTypesStr}${EOL}}`);
        break;
      default:
        if (property.type !== 'ID') {
          typescriptTypes.push(`${name}: ${schemaTypesToTypeScript[property.type] || property.type}`);
        } else {
          typescriptTypes.push(`${name}: unknown`);
          typescriptExtends.push(`${name}: any`);
        }
        break;
    }
  });

  return { typescriptTypes, typescriptExtends };
};
