

const merge = require('lodash.merge');
const Sequelizer = require('sequelizer');
const traverse = require('traverse');

const discardFields = ['_id'];

module.exports = function serviceSpecsToSequelize (feathersSpec, feathersExtension) {
  const obj = merge({}, feathersSpec);
  const seqFks = [];

  // Remove properties to discard.
  discardFields.forEach(name => {
    delete obj.properties[name];
  });

  //console.log('obj in=', obj.properties);

  // Process key and foreign key properties
  obj.properties = traverse(obj.properties).map(function (value) { // IMPORTANT 'function' is needed
    //console.log(value, this.isLeaf, this.key, this.path.length);

    if (this.isLeaf && value === 'ID' && this.key === 'type' && this.path.length === 2) {
      this.update('integer');

      if (this.path[0] !== 'id') {
        seqFks.push(this.path[0]);
      }
    }
  });

  //console.log('obj out=', obj.properties);

  // Convert to Sequelize model.
  const seqModel = Sequelizer.fromJsonSchema(obj, null, {
    notNullFields: obj.required || [],
    uniqueFields: obj.uniqueItemProperties || [],
  });

  //console.log('obj seq=', seqModel);

  // Add any missing attributes for key.
  if (seqModel.id) {
    if (!('autoIncrement' in seqModel.id)) {
      seqModel.id.autoIncrement = true;
    }
    if (!('primaryKey' in seqModel.id)) {
      seqModel.id.primaryKey = true;
    }
  }

  // Copy 'default' to Sequelize model
  Object.keys(obj.properties || {}).forEach(name => {
    const property = obj.properties[name];
    if ('default' in property) {
      seqModel[name].default = property.default;
    }
  });

  // Remove verbose attributes.
  Object.keys(seqModel).forEach(fieldName => {
    const fieldModel = seqModel[fieldName];

    if (fieldModel.unique === false) delete fieldModel.unique;
    if (fieldModel.allowNull === true) delete fieldModel.allowNull;
  });

  return { seqModel, seqFks };
};
