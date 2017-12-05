
const { camelCase, upperFirst } = require('lodash');
const mongoose = require('mongoose');
const { statSync } = require('fs');
const { join } = require('path');
const { EOL } = require('os');

const stringifyPlus = require('./stringify-plus');
const mongooseGen = require('./mongoose-gen');

const typeConvert = {
  ID: 'ID', // our extension to JSON-schema
  string: 'String',
  integer: 'Int',
  number: 'Float',
  boolean: 'Boolean',
  object: '*****',
  array: '*****',
  null: 'String', // todo should we throw on encountering this?
};

const nativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId',
};



// Get declaration for Feathers service
module.exports = function (serviceName, specs) {
  const specsServices = specs.services || {};
  const path = join(process.cwd(), specs.app.src, 'services', serviceName, `${serviceName}.schema`);

  if (fileExists(`${path}.js`)) {
    const { schema, extension } = require(path);

    if (schema && typeof schema === 'object' && schema !== null && schema.properties) {
      return feathersDeclarationToService(serviceName, schema, extension || {}, specsServices || {});
    }
  }

  return {
    mongooseSchema: {},
    mongooseSchemaStr: '{}',
  };
};

function feathersDeclarationToService(serviceName, feathersSchema, feathersExtension, specsServices) {
  if (typeof feathersSchema !== 'object' || feathersSchema === null) {
    throw new Error(`Expected feathersSchema object. Got ${typeof feathersSchema}`);
  }

  console.log('\nserviceName', serviceName);
  inspector('feathersSchema', feathersSchema);
  //inspector('feathersExtension', feathersExtension);
  //inspector('specsServices', specsServices);

  const mongooseSchema = mongooseGen.convert(dropProps(feathersSchema, 'id', '_id'));
  const mongooseSchemaStr = stringifyPlus(mongooseSchema, { nativeFuncs })

  return { mongooseSchema, mongooseSchemaStr };
}

function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return false;
  }
}

function dropProps(obj, ...names) {
  const result = Object.assign({}, obj);

  names.forEach(name => {
    delete result[name];
  });

  return result;
}

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
