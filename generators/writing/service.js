
const makeDebug = require('debug');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');
const traverse = require('traverse');
const { existsSync } = require('fs');
const { inspect } = require('util');
const { join } = require('path');

const serviceSpecsToMongoJsonSchema = require('../../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../../lib/service-specs-to-sequelize');
const serviceSpecsToTypescript = require('../../lib/service-specs-to-typescript');
const validateJsonSchema = require('../../lib/validate-json-schema');

const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:service');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

const mongooseNativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.Types.ObjectId]: 'mongoose.Schema.Types.ObjectId'
};

let sequelizeNativeFuncs = {
  [Sequelize.BOOLEAN]: 'DataTypes.BOOLEAN',
  [Sequelize.ENUM]: 'DataTypes.ENUM',
  [Sequelize.INTEGER]: 'DataTypes.INTEGER',
  [Sequelize.JSONB]: 'DataTypes.JSONB',
  [Sequelize.REAL]: 'DataTypes.REAL',
  [Sequelize.STRING]: 'DataTypes.STRING',
  [Sequelize.TEXT]: 'DataTypes.TEXT',
  [Sequelize.DATE]: 'DataTypes.DATE',
  [Sequelize.DATEONLY]: 'DataTypes.DATEONLY',
};

module.exports = {
  service,
};

function service (generator, name, props, specs, context, state, inject) {
  debug('service()');

  const {
    // Expanded definitions.
    mapping,
    feathersSpecs,
    // Paths.
    appConfigPath,
    // TypeScript & semicolon helpers.
    js,
    isJs,
    // Abstract .js and .ts statements.
    tplJsOrTs,
    tplJsOnly,
    tplTsOnly,
    tplImports,
    tplModuleExports,
    tplExport,
    // lodash utilities.
    camelCase,
    kebabCase,
    snakeCase,
    upperFirst,
    // Utilities.
    merge,
    EOL,
    stringifyPlus
  } = context;

  const {
    // File writing functions.
    tmpl,
    stripSlashes,
    // Abbreviations for paths to templates used in building 'todos'.
    tpl,
    src,
    srcPath,
    serPath,
    namePath,
    testPath,
    // Other abbreviations using in building 'todos'.
    libDir,
    testDir,
    // Utilities.
    generatorsInclude,
    // Constants.
    WRITE_IF_NEW,
    WRITE_ALWAYS,
  } = state;

  const { connection } = inject;

  const specsService = specs.services[name];
  const fileName = specsService.fileName;
  const camelName = camelCase(name);
  const snakeName = snakeCase(name);
  const adapter = specsService.adapter;
  const path = specsService.path;
  const isAuthEntityWithAuthentication = specsService.isAuthEntity ? specs.authentication : undefined;

  const moduleMappings = {
    generic: `./${fileName}.class`,
    memory: 'feathers-memory',
    nedb: 'feathers-nedb',
    mongodb: 'feathers-mongodb',
    mongoose: 'feathers-mongoose',
    sequelize: 'feathers-sequelize',
    knex: 'feathers-knex',
    rethinkdb: 'feathers-rethinkdb'
  };

  const serviceModule = moduleMappings[adapter];
  const modelTpl = `${adapter}${isAuthEntityWithAuthentication ? '-user' : ''}.ejs`;
  const hasModel = existsSync(join(srcPath, '_model', modelTpl));

  // Run `generate connection` for the selected adapter
  if (!generatorsInclude('all')) {
    if (adapter !== 'generic' && adapter !== 'memory') {

      // Do not `generate connection` on `generate service` if adapter already exists.
      if (!specs.connections || !specs.connections[adapter]) {
        generator.composeWith(require.resolve('../connection'), { props: {
            adapter,
            service: name
          } });
      } else {
        connection(generator, props, specs, context, state);
      }
    }
  }

  // inspector(`\n... specs (generator ${what})`, specs);
  // inspector('\n...mapping', mapping);
  // inspector(`\n... feathersSpecs ${name} (generator ${what})`, feathersSpecs[name]);

  // Validate JSON-schema (not non-JSON-schema props like .extensions)
  validateJsonSchema(name, feathersSpecs[name]);

  // Custom template context.
  const { typescriptTypes, typescriptExtends } =
    serviceSpecsToTypescript(specsService, feathersSpecs[name], feathersSpecs[name]._extensions);

  let graphqlTypeName;
  if (specs.graphql && specsService.graphql && name !== 'graphql') {
    graphqlTypeName = ((feathersSpecs[name]._extensions.graphql || {}).name)
      || (specsService.nameSingular.charAt(0).toUpperCase() + specsService.nameSingular.slice(1));
  }

  context = Object.assign({}, context, {
    serviceName: name,
    serviceNameSingular: specsService.nameSingular,
    subFolder: generator.getNameSpace(specsService.subFolder)[0],
    subFolderArray: generator.getNameSpace(specsService.subFolder)[1],
    subFolderReverse: generator.getNameSpace(specsService.subFolder)[2],
    primaryKey: feathersSpecs[name]._extensions.primaryKey,
    graphqlTypeName,
    camelName,
    kebabName: fileName,
    snakeName,
    adapter,
    path: stripSlashes(path),
    authentication: isAuthEntityWithAuthentication,
    isAuthEntityWithAuthentication,
    requiresAuth: specsService.requiresAuth,
    oauthProviders: [],
    hooks: getHookInfo(name),
    _hooks: specs._hooks[name] || [],

    libDirectory: specs.app.src,
    modelName: hasModel ? `${fileName}.model` : null,
    serviceModule,
    mongoJsonSchema: serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions),
    mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
  });
  context.mongoJsonSchemaStr = stringifyPlus(context.mongoJsonSchema);
  context.mongooseSchemaStr = stringifyPlus(context.mongooseSchema, { nativeFuncs: mongooseNativeFuncs });
  context.typescriptTypesStr = typescriptTypes.map(str => `  ${str}${context.sc}`).join(`${EOL}`);
  context.typescriptExtendsStr = typescriptExtends.map(str => `  ${str}${context.sc} // change if needed`).join(`${EOL}`);

  const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);

  // Process objects created by Sequelize.ENUM([option1, option2, ...])
  traverse(seqModel).forEach(function (value) {
    if (typeof value === 'object' && value instanceof Sequelize.ENUM) {
      // Replace Sequelize.ENUM object with a placeholder func that stringify-plus will replace
      const uniqueFunc = new Function(`return ${Math.random()};`);
      this.update(uniqueFunc);

      // Identify what stringify-plus should replace that unique function by
      const str = `Sequelize.ENUM(${JSON.stringify(value.values)})`;
      Object.assign(sequelizeNativeFuncs, { [uniqueFunc]: str });
    }
  });

  context.sequelizeSchema = seqModel;
  context.sequelizeFks = seqFks;
  context.sequelizeSchemaStr = stringifyPlus(context.sequelizeSchema, { nativeFuncs: sequelizeNativeFuncs });

  // inspector(`\n... mongoJsonSchema ${name} (generator ${what})`, context.mongooseSchema);
  // inspector(`\n... mongoJsonSchemaStr ${name} (generator ${what})`, context.mongooseSchemaStr.split('\n'));
  // inspector(`\n... mongooseSchema ${name} (generator ${what})`, context.mongooseSchema);
  // inspector(`\n... mongooseSchemaStr ${name} (generator ${what})`, context.mongooseSchemaStr.split('\n'));
  // inspector(`\n... sequelizeSchema ${name} (generator ${what})`, context.sequelizeSchema);
  // inspector(`\n... sequelizeSchemaStr ${name} (generator ${what})`, context.sequelizeSchemaStr.split('\n'));
  // inspector(`\n... sequelizeFks ${name} (generator ${what})`, context.sequelizeFks);
  // inspector(`\n... typescriptTypes ${name} (generator ${what})`, context.typescriptTypes);
  // inspector(`\n... typescriptTypesStr ${name} (generator ${what})`, context.typescriptTypesStr.split('\n'));
  // inspector(`\n... typescriptExtends${name} (generator ${what})`, context.typescriptExtends);
  // inspector(`\n... typescriptExtendsStr ${name} (generator ${what})`, context.typescriptExtendsStr.split('\n'));
  // inspector(`\n... context (generator ${what})`, context);

  const dependencies = ['ajv'];
  const devDependencies = [];

  if (!isJs) {
    switch (adapter) {
      case 'knex':
        devDependencies.push('@types/knex');
        break;
      case 'mongoose':
        devDependencies.push('@types/mongoose');
        break;
      case 'nedb':
        devDependencies.push('@types/nedb');
        break;
      case 'sequelize':
        devDependencies.push('@types/sequelize');
        break;
    }
  }

  // Set up strategies and add dependencies
  const strategies = (specs.authentication || {}).strategies || [];
  strategies.forEach(strategy => {
    const oauthProvider = OAUTH2_STRATEGY_MAPPINGS[strategy];

    if (oauthProvider) {
      dependencies.push('@feathersjs/authentication-oauth2');
      dependencies.push(oauthProvider);
      context.oauthProviders.push({
        name: strategy,
        strategyName: `${upperFirst(strategy)}Strategy`,
        module: oauthProvider
      });

    } else {
      dependencies.push(`@feathersjs/authentication-${strategy}`);
    }
  });

  // Custom abbreviations for building 'todos'.
  const serviceTpl = existsSync(join(serPath, '_service', `name.service-${adapter}.ejs`))
    ? `name.service-${adapter}.ejs` : 'name.service.ejs';
  const fn = fileName;
  const sfa = context.subFolderArray;

  const todos = [
    tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services',         `${fn}.test.${js}`],           WRITE_IF_NEW                         ),
    tmpl([srcPath,  '_model',   modelTpl],        [libDir,  'models',   ...sfa, `${context.modelName}.${js}`], WRITE_ALWAYS, !context.modelName    ),
    tmpl([serPath,  '_service', serviceTpl],      [libDir,  'services', ...sfa, fn, `${fn}.service.${js}`],    ),
    tmpl([namePath, 'name.class.ejs'],            [libDir,  'services', ...sfa, fn, `${fn}.class.${js}`],      WRITE_ALWAYS, adapter !== 'generic' ),
    tmpl([namePath, 'name.interface.ejs'],        [libDir,  'services', ...sfa, fn, `${fn}.interface.${js}`],  WRITE_ALWAYS, isJs ),

    tmpl([namePath, 'name.schema.ejs'],           [libDir,  'services', ...sfa, fn, `${fn}.schema.${js}`]      ),
    tmpl([namePath, 'name.mongo.ejs'],            [libDir,  'services', ...sfa, fn, `${fn}.mongo.${js}`]       ),
    tmpl([namePath, 'name.mongoose.ejs'],         [libDir,  'services', ...sfa, fn, `${fn}.mongoose.${js}`]    ),
    tmpl([namePath, 'name.sequelize.ejs'],        [libDir,  'services', ...sfa, fn, `${fn}.sequelize.${js}`]   ),
    tmpl([namePath, 'name.validate.ejs'],         [libDir,  'services', ...sfa, fn, `${fn}.validate.${js}`]    ),
    tmpl([namePath, 'name.hooks.ejs'],            [libDir,  'services', ...sfa, fn, `${fn}.hooks.${js}`]       ),
    tmpl([namePath, 'name.populate.ejs'],         [libDir,  'services', ...sfa, fn, `${fn}.populate.${js}`],   WRITE_ALWAYS, !graphqlTypeName        ),
    tmpl([serPath,  'index.ejs'],                 [libDir,  'services', `index.${js}`]                         ),

    tmpl([tpl, 'src', 'app.interface.ejs'], [src, 'app.interface.ts'],         WRITE_ALWAYS, isJs),
    tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             WRITE_ALWAYS, isJs),
  ];

  // Generate modules
  generatorFs(generator, context, todos);

  // Update dependencies
  if (serviceModule.charAt(0) !== '.') {
    dependencies.push(serviceModule);
  }

  generator._packagerInstall(dependencies, { save: true });
  generator._packagerInstall(devDependencies, { saveDev: true });

  // Determine which hooks are needed
  function getHookInfo(name) {
    const sc = context.sc;
    //const isMongo = (mapping.feathers[name] || {}).adapter === 'mongodb';
    const isMongo = specs.services[name].adapter === 'mongodb';
    const requiresAuth = specsService.requiresAuth;

    const hooks = [ 'iff' ];
    const imports = isJs ? [
      `const commonHooks = require('feathers-hooks-common')${sc}`
    ] : [
      `import * as commonHooks from 'feathers-hooks-common'${sc}`,
      `import { HooksObject } from '@feathersjs/feathers'${sc}`
    ];

    const comments = {
      before: [],
      after: [],
      error: [],
    };

    const code = {
      before: {
        all: [], find: [], get: [], create: [], update: [], patch: [], remove: []
      },
      after: {
        all: [], find: [], get: [], create: [], update: [], patch: [], remove: []
      },
      error: {
        all: [], find: [], get: [], create: [], update: [], patch: [], remove: []
      },
    };

    if (requiresAuth || isAuthEntityWithAuthentication) {
      if (isJs) {
        imports.push(`const { authenticate } = require('@feathersjs/authentication').hooks${sc}`);
      } else {
        imports.push(`import { hooks as authHooks } from '@feathersjs/authentication'${sc}`);
        imports.push(`const { authenticate } = authHooks${sc}`);
      }
    }

    if (!isAuthEntityWithAuthentication) {
      if (requiresAuth) {
        code.before.all.push('authenticate(\'jwt\')');
      }
    } else {
      // The order of the hooks is important
      if (isAuthEntityWithAuthentication.strategies.indexOf('local') !== -1) {

        if (isJs) {
          imports.push('// eslint-disable-next-line no-unused-vars');
          imports.push(`const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks${sc}`);
        } else {
          imports.push('// tslint:disable-next-line:no-unused-variable');
          imports.push(`import { hooks as localAuthHooks } from '@feathersjs/authentication-local'${sc}`);
          imports.push(`const { hashPassword, protect } = localAuthHooks${sc}`);
        }

        code.before.create.push('hashPassword()');
        code.before.update.push('hashPassword()');
        code.before.patch.push('hashPassword()');
        code.after.all.push('protect(\'password\') /* Must always be the last hook */');
      }

      code.before.find.push('authenticate(\'jwt\')');
      code.before.get.push('authenticate(\'jwt\')');
      code.before.update.push('authenticate(\'jwt\')');
      code.before.patch.push('authenticate(\'jwt\')');
      code.before.remove.push('authenticate(\'jwt\')');
    }

    if (isMongo) {
      imports.push(
        isJs ?
          `const { ObjectID } = require('mongodb')${sc}` :
          `import { ObjectID } from 'mongodb'${sc}`
      );
      hooks.push('mongoKeys');
      code.before.find.push('mongoKeys(ObjectID, foreignKeys)');
    }

    // Form comments summarizing the hooks
    Object.keys(code).forEach(type => {
      const typeHooks = [];

      Object.keys(code[type]).forEach(method => {
        const str = code[type][method].join(', ');

        if (str) {
          typeHooks.push(`//   ${method.padEnd(6)}: ${str}`);
        }
      });

      if (typeHooks.length) {
        typeHooks.unshift('// Your hooks should include:');
      }

      comments[type] = typeHooks;
    });

    return {
      imports,
      hooks: hooks.filter((val, i) => hooks.indexOf(val) === i), // unique
      comments,
      code,
      make: hooks => `${hooks.length ? ' ' : ''}${hooks.join(', ')}${hooks.length ? ' ' : ''}`
    };
  }
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
