
const { assert } = require('chai');
const Ajv = require('ajv');
const { inspect } = require('util');
const jsonSchemaDraft07Schema = require('../../lib/json-schema-draft-07-schema');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToTypescript = require('../../lib/service-specs-to-typescript');
const serviceSpecsToMongoJsonSchema = require('../../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../../lib/service-specs-to-sequelize');

const ajv = new Ajv();
const validate = ajv.compile(jsonSchemaDraft07Schema);
let errorMessages = null;

module.exports = function jsonSchemaRunner(options) {
  const {
    specs, fakeFeathersSchemas, expectedTypescriptTypes, expectedTypescriptExtends,
    expectedMongoJsonSchema, expectedMongooseSchema, expectedSeqModel, expectedSeqFks
  } = options;

  const { mapping, feathersSpecs } = serviceSpecsExpand(specs, null, fakeFeathersSchemas);
  // inspector('...mapping', mapping);
  // inspector('...feathersSpecs', feathersSpecs);

  Object.keys(specs.services).forEach(name => {
    console.log(`        compare service ${name}`);
    const specsService = specs.services[name];

    const isValid = validate(feathersSpecs[name]);
    if (!isValid) {
      addErrors(validate.errors);
      console.log(errorMessages);
    }
    if (!isValid) inspector('JSON-schema validation errors:', validate.errors);
    assert(isValid, 'invalid JSON-schema');

    const { typescriptTypes, typescriptExtends } =
      serviceSpecsToTypescript(specsService, feathersSpecs[name], feathersSpecs[name]._extensions);
    // inspector(`\n\n.....${name} typescriptTypes`, typescriptTypes);
    // inspector(`.....${name} typescriptExtends`, typescriptExtends);

    assert.deepEqual(typescriptTypes, expectedTypescriptTypes[name], 'typescriptTypes wrong');
    assert.deepEqual(typescriptExtends, expectedTypescriptExtends[name], 'typescriptExtends wrong');

    const mongoJsonSchema = serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions);
    // inspector(`.....${name} mongoJsonSchema`, mongoJsonSchema);

    assert.deepEqual(mongoJsonSchema, expectedMongoJsonSchema[name], 'mongoJsonSchema wrong');

    const mongooseSchema = serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions);
    // inspector(`.....${name} mongooseSchema`, mongooseSchema);

    assert.deepEqual(mongooseSchema, expectedMongooseSchema[name], 'mongooseSchema wrong');

    const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);
    // inspector(`.....${name} seqModel`, seqModel);
    // inspector(`.....${name} seqFks`, seqFks);

    assert.deepEqual(seqModel, expectedSeqModel[name], 'seqModel wrong');
    assert.deepEqual(seqFks, expectedSeqFks[name], 'seqFks wrong');
  });
};

function addErrors (errors) {
  errors.forEach(ajvError => {
    errorMessages = addNewError(errorMessages, ajvError);
  });
}

function addNewError (errorMessages, ajvError) {
  let message = `${ajvError.dataPath || ''} ${ajvError.message}`;

  if (ajvError.params) {
    if (ajvError.params.additionalProperty) {
      message += `: ${ajvError.params.additionalProperty}`;
    }
    if (ajvError.params.allowedValues) {
      message += `: ${ajvError.params.allowedValues}`;
    }
  }

  return (errorMessages || []).concat(message);
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
