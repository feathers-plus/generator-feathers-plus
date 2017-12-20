
const chalk = require('chalk');
const mongoose = require('mongoose');
const { statSync } = require('fs');
const { join } = require('path');

const stringifyPlus = require('./stringify-plus');
const toMongoose = require('./json-schema-to-mongoose');

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

    console.log('\n\n' + chalk.green.bold('We are regenerating an existing service.') + '\n');
    console.log(chalk.green([
      'Run "feathers-plus generate graphql" afterwards if you want any',
      'schema changes to also be handled in GraphQL.',
      '',
    ].join('\n')));

    if (schema && typeof schema === 'object' && schema !== null && schema.properties) {
      return Object.assign(
        { schema, extension},
        feathersDeclarationToService(serviceName, schema, extension || {}, specsServices || {})
      );
    }
  }

  console.log('\n\n' + chalk.green.bold('We are adding a new service.') + '\n');
  console.log(chalk.green([
    'Once this generation is complete, define the data schema in module',
    `"services/${serviceName}/${serviceName}.schema.js". Then (re)generate this service once more.`,
    '',
    'This second generation will take the schema you added and generate',
    '- A Mongoose model, and',
    '- A Sequelize model, and',
    '- Create, update and patch validation hooks.',
    '',
    'Run "feathers-plus generate graphql" if you want the schema also handled in GraphQL.',
    '',
  ].join('\n')));

  return {
    schema: {},
    extension: {},
    mongooseSchema: {},
    mongooseSchemaStr: '{}',
  };
};

function feathersDeclarationToService(serviceName, feathersSchema, feathersExtension, specsServices) {
  if (typeof feathersSchema !== 'object' || feathersSchema === null) {
    throw new Error(`Expected feathersSchema object. Got ${typeof feathersSchema}`);
  }

  const mongooseSchema = toMongoose.convert(dropProps(feathersSchema, 'id', '_id'));
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
