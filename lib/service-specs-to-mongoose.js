
const mongoose = require('mongoose');

const typeEquivalence = { // json-schema: mongoose
  'array': Array,
  'buffer': Buffer,
  'boolean': Boolean,
  'date': Date,
  'mixed': mongoose.Schema.Types.Mixed,
  'number': Number,
  'objectid': mongoose.Schema.Types.ObjectId,
  'string': String,
  'object': Object,
  'integer': Number,
  'ID': mongoose.Schema.Types.ObjectId // Our GraphQL custom scalar
};

//json-schema: mongoose
const keywordEquivalence = {
  // string
  pattern: 'match', // regex
  enum: 'enum', // array
  minLength: null, // integer
  maxLength: null, // integer
  // numeric
  multipleOf: null, // number
  minimum: 'min', // number
  maximum: 'max', // number
  exclusiveMinimum: null, // boolean
  exclusiveMaximum: null, // boolean
  // object
  minProperties: null, // integer
  maxProperties: null, // integer
  dependencies: null, // object
  patternProperties: null, // object
  // array
  minItems: null, // integer
  maxItems: null, // integer
  uniqueItems: null, // boolean
  // boolean - none
  // null - none

 lowercase: null, // boolean
 uppercase: null, // boolean
 trim: null, // boolean
 ref: null, // boolean
 index: null, // boolean
 unique: null, // boolean
 sparse: null, // boolean
 nullable: null, // boolean
 default: null //any
};

const discardFields = ['id', '_id'];

// Convert the JSON-schema { properties: { ... }, ... }
function serviceSpecsToMongoose (feathersSpec, feathersExtension, depth = 1) {
  const required = feathersSpec.required || [];
  const uniqueItemProperties = feathersSpec.uniqueItemProperties || [];
  const properties = feathersSpec.properties || {};
  const mongooseSchema = {};
  let items;

  Object.keys(properties).forEach(name => {
    if (discardFields.indexOf(name) !== -1) return;

    const property = properties[name];
    let type = property.type;
    mongooseSchema[name] = {};
    let mongooseProperty = mongooseSchema[name];

    switch (type) {
      case 'array':
        items = Array.isArray(property.items) ? property.items : [property.items];
        mongooseProperty = serviceSpecsProcessArray(items, mongooseProperty, mongooseSchema, name, feathersExtension, depth);
        break;
      case 'object':
        mongooseSchema[name] = serviceSpecsToMongoose(property, feathersExtension, ++depth);
        mongooseProperty = mongooseSchema[name];
        break;
      default:
        if(hasDateFormat(property))
        {
          type = 'date';
        }
        mongooseProperty.type = toMongooseType(type);
        copyOtherMongooseAttributes(property,mongooseProperty);
        break;
    }

    if (required.indexOf(name) !== -1 && type !== 'object') {
      mongooseProperty.required = true;
    }

    if (uniqueItemProperties.indexOf(name) !== -1 && type !== 'object') {
      mongooseProperty.unique = true;
    }

    // Abbreviate the field model if it only has a type
    if (hasOnlyTypeProperty(mongooseProperty)) {
      mongooseSchema[name] = mongooseProperty.type;
    }
  });

  return mongooseSchema;
}

function serviceSpecsProcessArray(items, mongooseProperty, mongooseSchema, name, feathersExtension, depth) {
    const item = items[0];
    const type = item.type;
    if(type === 'object')
    {
      mongooseSchema[name] = [serviceSpecsToMongoose(item, feathersExtension, ++depth)];
      mongooseProperty = mongooseSchema[name];
    }else{
      mongooseProperty.type = [toMongooseType(type)];
      if (!hasOnlyTypeProperty(item)) {
          mongooseProperty.type = mongooseProperty.type[0];
          copyOtherMongooseAttributes(item, mongooseProperty);
          mongooseSchema[name] = [mongooseProperty];
          mongooseProperty = mongooseSchema[name];
      }
    }
    return mongooseProperty;
}

function toMongooseType(srcType, defaultType)
{
  return typeEquivalence[srcType] || defaultType || String;
}

function hasDateFormat(property) {
    return property.format && property.format.indexOf('date') > -1;
}

function hasOnlyTypeProperty(object)
{
  const attrs = Object.keys(object);
  return attrs.length === 1 && attrs[0] === 'type';
}

function copyOtherMongooseAttributes(property,mongooseProperty)
{
  Object.keys(property).forEach(attributeName => {
    if(typeof keywordEquivalence[attributeName] != 'undefined')
    {
      let equivalence = keywordEquivalence[attributeName] || attributeName;
      mongooseProperty[equivalence] = property[attributeName];
    }
  });
}

module.exports = serviceSpecsToMongoose;

/* Code from topliceanu/mongoose-gen that we are not using (yet?)

// Dict to keep all registered custom validators, setters, getters and defaults.
const hash = {
  validator: {},
  setter: {},
  getter: {},
  default: {}
};

/**
 * Creates functions specialized in registering custom validators, setters,
 * getters and defaults.
 * @param {String} param - one of 'validator', 'setter', 'getter', 'default'
 * @throws Error
 * @return {Function}
 * /
const set = function (param) {
  return function (key, value) {
    switch (param) {
      case 'validator':
        hash.validator[key] = value;
        break;
      case 'setter':
        hash.setter[key] = value;
        break;
      case 'getter':
        hash.getter[key] = value;
        break;
      case 'default':
        hash.default[key] = value;
        break;
    }
  };
};

/**
 * Returns a previously registered function.
 * @param {String} param - one of 'validator', 'setter', 'getter', 'default'
 * @param {String} key - the name under which the value was registered.
 * @throws Error
 * @return {Function}
 * /
const get = function (param, key) {
  const fn = hash && hash[param] && hash[param][key];
  if (!fn) {
    throw new Error('Unregistered "'+param+'" with name "'+key+'"');
  }
  return fn;
};

/**
 * Function verifies that `value` is a valid parameter of RegExp constructor.
 * @param {String} type
 * @param {String} value
 * @throws Error
 * @return {RegExp}
 * /
const check = function (type, value) {
  if (type === 'match') {
    if (!_.isString(value)) {
      throw new Error('expected string for match key');
    }
    return new RegExp(value);
  }
  throw new Error('unexpected type '+type);
};

/**
 * Converts a plain json schema definition into a mongoose schema definition.
 *
 * @param {Object} descriptor
 * @return {Object}
 * /
const convert = function (descriptor) {
  return traverse(descriptor).map(function (value) { // IMPORTANT Must use function
    // convert json-schema array to mongoose array
    if (typeof value === 'object' && value.type === 'array') {
      this.update(value.items || {});
      return;
    }

    console.log(this.key, this.isLeaf);

    if (this.isLeaf) {
      const key = this.key;

      if (key === 'type') {
        return this.update(convertType(value));
      }

      const mongooseKeyword = keywordEquivalence[key];
      if (mongooseKeyword) {

      }

      if (key === 'validate') {
        return this.update(get('validator', value));
      }
      if (key === 'get') {
        return this.update(get('getter', value));
      }
      if (key === 'set') {
        return this.update(get('setter', value));
      }
      if (key === 'default') {
        if (typeof value !== 'function') {
          this.update(get('default', value));
        }
        return;
      }
      if (key === 'match') {
        return this.update(check(key, value));
      }
      return this.update( value);
    }
  });
};

const convertType = type => {
  const mongooseType = typeEquivalence[type.toLowerCase()];
  if (!mongooseType) throw new Error(`Cannot convert JSON-schema type ${type} to Mongoose.`);

  return mongooseType;
};

/**
 * Extend mongoose.Schema to allow schema definition from plain json documents.
 *
 * @class Schema
 * @param {Object} descriptor
 * @param {mongoose.Connection} connection
 * @param {Object} options
 * /
const getSchema = function (descriptor, connection, options) {
  const definition = convert(descriptor);
  return new connection.Schema(definition, options);
};

// Private api, just for testing.
exports._hash = hash;
exports._get = get;
exports._matchType = convertType;
exports._check = check;

// Public api.
exports.setValidator = set('validator');
exports.setSetter = set('setter');
exports.setGetter = set('getter');
exports.setDefault = set('default');
exports.convert = feathersSpecToMongoose; //convert;
exports.getSchema = getSchema;
*/
