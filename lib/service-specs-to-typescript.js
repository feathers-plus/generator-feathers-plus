
const EOL = '\n';

module.exports = function serviceSpecsToTypescript (specsService, feathersSpec, feathersExtension, depth = 1) {
  const properties = feathersSpec.properties || {};
  const tsTypes = [];

  const { idName, idType } = feathersExtension.primaryKey;

  const schemaTypesToTypeScript = {
    ID: idType,
    integer: 'number',
  };

  Object.keys(properties).forEach(name => {
    const property = properties[name];
    if (property.type === 'ID' && name !== idName) return;

    let subTypes, subTypesStr;
    switch (property.type) {
      case 'object':
        subTypes = serviceSpecsToTypescript(specsService, property, feathersExtension, ++depth);
        subTypesStr = subTypes.map(str => `  ${str}`).join(`;${EOL}`);
        tsTypes.push(`${name}: {${EOL}${subTypesStr}${EOL}}`);
        break;
      default:
        tsTypes.push(`${name}: ${schemaTypesToTypeScript[property.type] || property.type}`);
        break;
    }
  });

  return tsTypes;
};
