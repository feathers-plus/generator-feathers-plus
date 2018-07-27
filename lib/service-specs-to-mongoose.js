
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

// Not used right now. json-schema: mongoose
const keywordEquivalence = {  // eslint-disable-line no-unused-vars
  type: undefined, // handled by code
  // string
  pattern: 'match', // regex
  enum: 'enum', // array
  minLength: null, // integer
  maxLength: null, // integer
  'date-time': null,
  email: null,
  hostname: null,
  ipv4: null,
  ipv6: null,
  uri: null,
  // numeric
  multipleOf: null, // number
  minimum: 'min', // number
  maximum: 'max', // number
  exclusiveMinimum: null, // boolean
  exclusiveMaximum: null, // boolean
  // object
  properties: undefined, // handled by code
  additionalProperties: null, // boolean or e.g. { type: 'string' }
  // required: undefined, // handled by code
  minProperties: null, // integer
  maxProperties: null, // integer
  dependencies: null, // object
  patternProperties: null, // object
  // array
  items: undefined, // handled by code
  minItems: null, // integer
  maxItems: null, // integer
  uniqueItems: null // boolean
  // boolean - none
  // null - none
  /*
   Keywords supported by Mongoose which we don't use:
     'required', // schema supported, boolean or function, if true adds a required validator for this property
     'lowercase',
     'uppercase',
     'trim',
     'ref',
     'default', // Any or function, sets a default value for the path. If the value is a function, the return value of the function is used as the default.
     'select', // boolean, specifies default projections for queries
     'get', // function, defines a custom getter for this property using Object.defineProperty().
     'set', // function, defines a custom setter for this property using Object.defineProperty().
     'index',
     'unique',
     'sparse',
     'validate', // function, adds a validator function for this property
   */
};

const discardFields = ['id', '_id'];

// Convert the JSON-schema { properties: { ... }, ... }
module.exports = function serviceSpecsToMongoose (feathersSpec, feathersExtension, depth = 1) {
  const required = feathersSpec.required || [];
  const uniqueItemProperties = feathersSpec.uniqueItemProperties || [];
  const properties = feathersSpec.properties || {};
  const mongooseSchema = {};

  Object.keys(properties).forEach(name => {
    if (discardFields.indexOf(name) !== -1) return;

    const property = properties[name];
    mongooseSchema[name] = {};
    let mongooseProperty = mongooseSchema[name];

    switch (property.type) {
      case 'array':
        mongooseProperty.type = [typeEquivalence[property.items[0].type]];
        if (property.items[0].enum) {
          mongooseProperty.enum = property.items[0].enum;
        }
        break;
      case 'object':
        mongooseSchema[name] = serviceSpecsToMongoose(property, feathersExtension, ++depth);
        mongooseProperty = mongooseSchema[name];
        break;
      default:
        mongooseProperty.type = typeEquivalence[property.type] || property.type;
        if (property.enum) {
          mongooseProperty.enum = property.enum;
        }
        break;
    }

    if (required.indexOf(name) !== -1 && property.type !== 'object') {
      mongooseProperty.required = true;
    }

    if (uniqueItemProperties.indexOf(name) !== -1 && property.type !== 'object') {
      mongooseProperty.unique = true;
    }

    // Abbreviate the field model if it only has a type
    const attrs = Object.keys(mongooseProperty);

    if (attrs.length === 1 && attrs[0] === 'type') {
      mongooseSchema[name] = mongooseProperty.type;
    }
  });

  return mongooseSchema;
};

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
