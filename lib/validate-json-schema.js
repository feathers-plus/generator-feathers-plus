
const Ajv = require('ajv');
const jsonSchemaDraft07Schema = require('./json-schema-draft-07-schema');
const validationErrorsLog = require('./validation-errors-log');

const ajv = new Ajv();
const validate = ajv.compile(jsonSchemaDraft07Schema);

module.exports = validateJsonSchema;

function validateJsonSchema(name, feathersSpec) {
  const isValid = validate(feathersSpec);

  if (!isValid) {
    const errorMessages = addErrors(validate.errors);
    validationErrorsLog(`Validation errors in JSON-schema for service ${name}`, errorMessages);
  }
}

function addErrors (errors) {
  let errorMessages;

  errors.forEach(ajvError => {
    errorMessages = addNewError(errorMessages, ajvError);
  });

  return errorMessages;
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
