
/* eslint-disable no-console */
const crypto = require('crypto');
const merge = require('lodash.merge');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const { camelCase, kebabCase, snakeCase, upperFirst } = require('lodash');
const { existsSync } = require('fs');
const { inspect } = require('util');
const { join } = require('path');

const { generatorFs } = require('../../lib/generator-fs');
const makeConfig = require('./templates/_configs');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToGraphql = require('../../lib/service-specs-to-graphql');
const serviceSpecsToMongoJsonSchema = require('../../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../../lib/service-specs-to-sequelize');
const serviceSpecsToTypescript = require('../../lib/service-specs-to-typescript');
const stringifyPlus = require('../../lib/stringify-plus');

const { updateSpecs } = require('../../lib/specs');

const EOL = '\n';

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

const AUTH_TYPES = {
  local: '@types/feathersjs__authentication-local',
  auth0: '@types/feathersjs__authentication-oauth2',
  google: '@types/feathersjs__authentication-oauth2',
  facebook: ['@types/passport-facebook', '@types/feathersjs__authentication-oauth2'],
  github: '@types/passport-github',
};

const mongooseNativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.Types.ObjectId]: 'mongoose.Schema.Types.ObjectId'
};

const sequelizeNativeFuncs = {
  [Sequelize.BOOLEAN]: 'DataTypes.BOOLEAN',
  [Sequelize.ENUM]: 'DataTypes.ENUM',
  [Sequelize.INTEGER]: 'DataTypes.INTEGER',
  [Sequelize.JSONB]: 'DataTypes.JSONB',
  [Sequelize.REAL]: 'DataTypes.REAL',
  [Sequelize.STRING]: 'DataTypes.STRING',
  [Sequelize.TEXT]: 'DataTypes.TEXT',
};

// type:   'tpl' - expand template, 'copy' - copy file, 'json' - write JSON as file.
// src:    path & file of template or source file. Array of folder names or str.
// obj:    Object to write as JSON.
// dest:   path & file of destination. Array to .join() or str.
// ifNew:  true: Write file only if it does not yet exist, false: always write it.
// ifSkip: true: Do not write this file, false: write it.
// ctx:    Extra content to call template with.
// Note that frozen files are never written.
function tmpl (src, dest, ifNew, ifSkip, ctx) {
  return { type: 'tpl', src, dest, ifNew, ifSkip, ctx };
}

function copy (src, dest, ifNew, ifSkip, ctx) {
  return { type: 'copy', src, dest, ifNew, ifSkip, ctx };
}

function json (obj, dest, ifNew, ifSkip, ctx) {
  return { type: 'json', obj, dest, ifNew, ifSkip, ctx };
}

function stripSlashes (name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}

// Abstract statements between .js and .ts
function abstractTs(specs) {
  const ifTs = specs.options.ts;
  const sc = specs.options.semicolons ? ';' : '';

  return {
    tplJsOrTs: (value, valueTs) => ifTs ? valueTs : value,
    tplJsOnly: lines => {
      lines = Array.isArray(lines) ? lines : [lines];

      return !ifTs ? lines.join(EOL) : '';
    },
    tplTsOnly: lines => {
      lines = Array.isArray(lines) ? lines : [lines];

      return ifTs ? lines.join(EOL) : '';
    },
    tplImports: (vars, module, format, useConst = 'const') => {
      if (!ifTs) return `${useConst} ${vars} = require('${module || vars}')${sc}`;

      // todo [removed] if (format === 'req') return `import ${vars} = require('${module || vars}')${sc}`;
      if (format === 'as') return `import * as ${vars} from '${module || vars}'${sc}`;
      return `import ${vars} from '${module || vars}'${sc}`;
    },
    tplModuleExports: (type, value = '{', valueTs) => {
      if (!ifTs) return `let moduleExports = ${value}`;

      if (type) return `let moduleExports: ${type} = ${valueTs || value}`;
      return `let moduleExports = ${valueTs || value}`;
    },
    tplExport: (value, valueTs) => {
      if (!ifTs) return `module.exports = ${value}`;

      return `export default ${valueTs || value}`;
    },
  };
}

// Utilities
let generators;
function generatorsInclude (name) {
  return generators.indexOf(name) !== -1;
}

module.exports = function generatorWriting (generator, what) {
  // Update specs with answers to prompts
  let { props, _specs: specs } = generator;
  updateSpecs(what, props, `${what} generator`);

  if (what === 'options') return;

  // Get unique generators which have been run
  generators = [...new Set(specs._generators)].sort();

  // Abbreviations for paths used in building 'todos'.
  const tpl = join(__dirname, 'templates');
  const src = specs.app.src;
  const srcPath = join(tpl, 'src');
  const mwPath = join(srcPath, 'middleware');
  const serPath = join(srcPath, 'services');
  const namePath = join(serPath, 'name');
  const qlPath = join(serPath, 'graphql');
  const testPath = join(tpl, 'test');

  const js = specs.options.ts ? 'ts' : 'js';
  const isJs = !specs.options.ts;
  const { tplJsOrTs, tplJsOnly, tplTsOnly, tplImports, tplModuleExports, tplExport } = abstractTs(specs);

  // Other abbreviations using in building 'todos'.
  const libDir = specs.app.src;
  let todos;

  let testDir = generator.testDirectory;
  if (testDir.charAt(testDir.length - 1) === '/') {
    testDir = testDir.substring(0, testDir.length - 1);
  }

  // Get expanded Feathers service specs
  const { mapping, feathersSpecs } = serviceSpecsExpand(specs);

  // Basic context used with templates.
  let context = Object.assign({}, {
    // Expanded definitions.
    specs,
    feathersSpecs,
    mapping,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
    getNameSpace(str) { return generator.getNameSpace(str); },

    // TypeScript & semicolon helpers.
    js,
    isJs,
    sc: specs.options.semicolons ? ';' : '',

    // Abstract .js and .ts linting.
    lintRule: isJs ? 'eslint ' : 'tslint:',
    lintDisable: isJs ?  'eslint-disable' : 'tslint:disable',
    lintDisableUnused: isJs ? 'eslint-disable no-unused-vars' : 'tslint:disable no-unused-variable',
    lintDisableNextLine: isJs ?  'eslint-disable-next-line' : 'tslint:disable-next-line',
    lintDisableNextLineUnused: isJs ?
      'eslint-disable-next-line no-unused-vars' : 'tslint:disable-next-line no-unused-variable',
    ruleQuoteDisable: isJs ? 'quotes: 0' : 'disable:quotemark',

    // Abstract .js and .ts statements.
    tplJsOrTs,
    tplJsOnly,
    tplTsOnly,
    tplImports,
    tplModuleExports,
    tplExport,

    // Utilities.
    camelCase,
    kebabCase,
    snakeCase,
    upperFirst,
    merge,
    EOL,
    stringifyPlus
  });

  // Generate what is needed.
  switch (what) {
    case 'all':
      app(generator);

      Object.keys(specs.services || {}).forEach(name => {
        service(generator, name);
      });

      authentication(generator);

      connection(generator);

      middleware(generator);

      if (
        specs.graphql &&
        (Object.keys(mapping.graphqlService).length || Object.keys(mapping.graphqlSql).length)
      ) {
        graphql(generator);
      }
      break;
    case 'app':
      app(generator);
      break;
    case 'service':
      service(generator, props.name);
      break;
    case 'connection':
      connection(generator);
      break;
    case 'authentication':
      authentication(generator);
      break;
    case 'middleware':
      middleware(generator);
      break;
    case 'graphql':
      graphql(generator);
      break;
    default:
      throw new Error(`Unexpected generate ${what}. (writing`);
  }

  // ===== app =====================================================================================
  function app (generator) {
    // Custom abbreviations for building 'todos'.

    // Configurations
    const pkg = generator.pkg = generator.fs.readJSON(
      generator.destinationPath('package.json'), makeConfig.package(generator)
    );

    const configDefault = specs._defaultJson = generator.fs.readJSON(
      generator.destinationPath('config/default.json'), makeConfig.configDefault(generator)
    );
    const configProd = generator.fs.readJSON(
      generator.destinationPath('config/production.json'), makeConfig.configProduction(generator)
    );

    // Modify .eslintrc for semicolon option
    let eslintrcExists = true;
    let eslintrcChanged = false;
    let eslintrc = generator.fs.readJSON(join(process.cwd(), '.eslintrc.json'), {});

    if (!Object.keys(eslintrc).length) {
      eslintrcExists = false;
      eslintrc = generator.fs.readJSON(join(tpl, '_eslintrc.json'), {});
    }

    const rules = eslintrc.rules = eslintrc.rules || {};
    const rulesSemi = rules.semi;

    if (context.sc) {
      // semicolons used
      if (!Array.isArray(rulesSemi) || rulesSemi[0] !== 'error') {
        eslintrc.rules.semi = ['error', 'always'];
        eslintrcChanged = true;
      }
    } else {
      // semicolons not used
      if (rulesSemi) {
        delete rules.semi;
        eslintrcChanged = true;
      }
    }

    // Custom template context.
    context = Object.assign({}, context, {
      getNameSpace: generator.getNameSpace
    });

    // Modules to generate
    todos = [
      copy([tpl, '_editorconfig'], '.editorconfig', true),
      // This name hack is necessary because NPM does not publish `.gitignore` files
      copy([tpl, '_gitignore'],    '.gitignore', true),
      copy([tpl, 'LICENSE'],       'LICENSE', true),
      tmpl([tpl, 'README.md.ejs'], 'README.md', true),

      copy([tpl, 'public', 'favicon.ico'], ['public', 'favicon.ico'], true),
      copy([tpl, 'public', 'index.html'],  ['public', 'index.html'], true),

      tmpl([tpl, 'test', 'app.test.ejs'],  [testDir, `app.test.${js}`], true),

      tmpl([tpl, 'src', 'hooks', 'log.ejs'],    [src, 'hooks', `log.${js}`], true),
      copy([tpl, 'src', 'refs', 'common.json'], [src, 'refs', 'common.json'], true),
      tmpl([tpl, 'src', 'channels.ejs'],        [src, `channels.${js}`], true),

      json(pkg,           'package.json'),
      json(configDefault, ['config', 'default.json']),
      json(configProd,    ['config', 'production.json']),

      tmpl([tpl, 'src', 'index.ejs'],     [src, `index.${js}`]),
      tmpl([tpl, 'src', 'app.hooks.ejs'], [src, `app.hooks.${js}`]),
      tmpl([tpl, 'src', 'logger.ejs'],    [src, `logger.${js}`]),

      tmpl([mwPath, 'index.ejs'],             [src, 'middleware', `index.${js}`]            ),
      tmpl([srcPath, 'app.ejs'],              [src, `app.${js}`]                            ),
      tmpl([serPath, 'index.ejs'],            [src, 'services', `index.${js}`]              ),
      tmpl([tpl, 'src', 'app.interface.ejs'], [src, 'app.interface.ts'],         false, isJs),
      tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             false, isJs),
    ];

    if (isJs) {
      todos = todos.concat(
        json(eslintrc, '.eslintrc.json', null, eslintrcExists && !eslintrcChanged),
      );
    } else {
      todos = todos.concat(
        copy([tpl, 'tslint.json'], 'tslint.json', true),
        tmpl([tpl, 'tsconfig.json'], 'tsconfig.json', true),
        copy([tpl, 'tsconfig.test.json'], 'tsconfig.test.json', true),
      );
    }

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator.dependencies = [
      '@feathersjs/configuration',
      '@feathersjs/errors',
      '@feathersjs/express',
      '@feathersjs/feathers',
      'compression',
      'cors',
      'feathers-hooks-common',
      'helmet',
      'lodash.merge',
      'serve-favicon',
      'winston@^3.0.0',
    ];

    generator.devDependencies = [
      'mocha',
      'request',
      'request-promise'
    ];

    if (isJs) {
      generator.devDependencies = generator.devDependencies.concat([
        'eslint',
      ]);
    } else {
      generator.devDependencies = generator.devDependencies.concat([
        '@types/feathersjs__configuration',
        '@types/feathersjs__errors',
        '@types/feathersjs__feathers',
        '@types/lodash.merge',
        '@types/mocha',
        '@types/request-promise',
        '@types/winston',
        'ts-mocha',
        'ts-node',
        'tslint',
        'typescript',
      ]);

      if (specs.app.providers.indexOf('rest') !== -1) {
        generator.devDependencies = generator.devDependencies.concat([
          '@types/feathersjs__express',
          '@types/compression',
          '@types/cors',
          '@types/helmet',
          '@types/serve-favicon',
        ]);
      }

      if (specs.app.providers.indexOf('socketio') !== -1) {
        generator.devDependencies.push('@types/feathersjs__socketio');
      }

      if (specs.app.providers.indexOf('primus') !== -1) {
        generator.devDependencies.push('@types/feathersjs__primus');
      }
    }

    specs.app.providers.forEach(provider => {
      const type = provider === 'rest' ? 'express' : provider;

      generator.dependencies.push(`@feathersjs/${type}`);
    });

    const extraDeps = specs['additional-dependencies'];
    if (extraDeps && extraDeps.length) {
      generator.dependencies = generator.dependencies.concat(extraDeps);
    }

    const extraDevDeps = specs['additional-devDependencies'];
    if (extraDevDeps && extraDevDeps.length) {
      generator.devDependencies = generator.devDependencies.concat(extraDevDeps);
    }

    generator._packagerInstall(generator.dependencies, { save: true });
    generator._packagerInstall(generator.devDependencies, { saveDev: true });
  }

  // ===== service =================================================================================
  function service (generator, name) {
    const specsService = specs.services[name];
    const kebabName = kebabCase(name);
    const camelName = camelCase(name);
    const snakeName = snakeCase(name);
    const adapter = specsService.adapter;
    const path = specsService.path;
    const isAuthEntityWithAuthentication = specsService.isAuthEntity ? specs.authentication : undefined;

    const moduleMappings = {
      generic: `./${kebabName}.class`,
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

        // Do not `generate connection` on `generate service` if adapter already exists
        // You can change that connection by running `generate connection`.
        if (!specs.connections || !specs.connections[adapter]) {
          generator.composeWith(require.resolve('../connection'), { props: {
            adapter,
            service: name
          } });
        }
      }
    }

    // inspector(`\n... specs (generator ${what})`, specs);
    // inspector('\n...mapping', mapping);
    // inspector(`\n... feathersSpecs ${name} (generator ${what})`, feathersSpecs[name]);

    // Custom template context.
    context = Object.assign({}, context, {
      serviceName: name,
      serviceNameSingular: specsService.nameSingular,
      subFolder: generator.getNameSpace(specsService.subFolder)[0],
      subFolderArray: generator.getNameSpace(specsService.subFolder)[1],
      subFolderReverse: generator.getNameSpace(specsService.subFolder)[2],
      primaryKey: feathersSpecs[name]._extensions.primaryKey,
      camelName,
      kebabName,
      snakeName,
      adapter,
      path: stripSlashes(path),
      authentication: isAuthEntityWithAuthentication,
      isAuthEntityWithAuthentication,
      requiresAuth: specsService.requiresAuth,
      oauthProviders: [],
      hooks: getHookInfo(name),

      libDirectory: specs.app.src,
      modelName: hasModel ? `${kebabName}.model` : null,
      serviceModule,
      mongoJsonSchema: serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions),
      mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
      typescriptTypes: serviceSpecsToTypescript(specsService, feathersSpecs[name], feathersSpecs[name]._extensions),
    });
    context.mongoJsonSchemaStr = stringifyPlus(context.mongoJsonSchema);
    context.mongooseSchemaStr = stringifyPlus(context.mongooseSchema, { nativeFuncs: mongooseNativeFuncs });
    context.typescriptTypesStr = context.typescriptTypes.map(str => `  ${str}`).join(`${context.sc}${EOL}`) +
      (context.typescriptTypes.length ? `${context.sc}` : '');

    const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);
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
    // inspector(`\n... context (generator ${what})`, context);

    const dependencies = ['ajv'];
    const devDependencies = [];

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
    const kn = kebabName;
    const sfa = context.subFolderArray;

    todos = [
      tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services', ...sfa, `${kn}.test.${js}`],         ),
      tmpl([srcPath,  '_model',   modelTpl],        [libDir,  'models',   ...sfa, `${context.modelName}.${js}`],  false, !context.modelName    ),
      tmpl([serPath,  '_service', serviceTpl],      [libDir,  'services', ...sfa, kn, `${kn}.service.${js}`],   ),
      tmpl([namePath, 'name.class.ejs'],            [libDir,  'services', ...sfa, kn, `${kn}.class.${js}`],     false, adapter !== 'generic' ),
      tmpl([namePath, 'name.interface.ejs'],        [libDir,  'services', ...sfa, kn, `${kn}.interface.${js}`], false, isJs ),

      tmpl([namePath, 'name.schema.ejs'],           [libDir,  'services', ...sfa, kn, `${kn}.schema.${js}`]     ),
      tmpl([namePath, 'name.mongo.ejs'],            [libDir,  'services', ...sfa, kn, `${kn}.mongo.${js}`]      ),
      tmpl([namePath, 'name.mongoose.ejs'],         [libDir,  'services', ...sfa, kn, `${kn}.mongoose.${js}`]   ),
      tmpl([namePath, 'name.sequelize.ejs'],        [libDir,  'services', ...sfa, kn, `${kn}.sequelize.${js}`]  ),
      tmpl([namePath, 'name.validate.ejs'],         [libDir,  'services', ...sfa, kn, `${kn}.validate.${js}`]   ),
      tmpl([namePath, 'name.hooks.ejs'],            [libDir,  'services', ...sfa, kn, `${kn}.hooks.${js}`]      ),
      tmpl([serPath,  'index.ejs'],                 [libDir,  'services', `index.${js}`]                ),

      tmpl([tpl, 'src', 'app.interface.ejs'], [src, 'app.interface.ts'],         false, isJs),
      tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             false, isJs),
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
      const isMongo = (mapping.feathers[name] || {}).adapter === 'mongodb';
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
            imports.push('// tslint:disable-next-line no-unused-variable');
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

  // ===== connection ==============================================================================
  function connection (generator) {
    if (!specs.connections) return;

    // Common abbreviations for building 'todos'.
    const newConfig = specs._defaultJson = Object.assign({}, specs._defaultJson, specs._dbConfigs);
    const connections = specs.connections;
    const _adapters = specs._adapters;
    const isGenerateConnection = generatorsInclude('connection') && !generatorsInclude('service');

    const todos = !Object.keys(connections).length ? [] : [
      json(newConfig, ['config', 'default.json']),
      tmpl([srcPath, 'app.ejs'], [libDir, `app.${js}`]),
      tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             false, isJs),
    ];

    Object.keys(_adapters).sort().forEach(adapter => {
      if (connections[adapter]) {
        // Force a regen for the adapter selected using `generate connection`.
        const forceWrite = isGenerateConnection && props.adapter === adapter;

        todos.push(
          tmpl(
            [srcPath, '_adapters', _adapters[adapter]],
            [libDir, `${adapter}.${js}`],
            !forceWrite, false, { database: connections[adapter].database } )
        );
      }
    });

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator.dependencies = generator.dependencies.concat(specs._connectionDeps);
    generator._packagerInstall(generator.dependencies, { save: true });

    generatorFs(generator, context, todos);
  }

  // ===== authentication ==========================================================================
  function authentication (generator) {
    if (!specs.authentication) return;

    // Custom template context
    const entity = specs.authentication.entity;
    const strategies = specs.authentication.strategies;

    context = Object.assign({}, context, {
      kebabEntity: kebabCase(entity),
      camelEntity: camelCase(entity),
      oauthProviders: [],
      strategies
    });

    const dependencies = [
      '@feathersjs/authentication',
      '@feathersjs/authentication-jwt'
    ];

    let devDependencies = [
      '@types/feathersjs__authentication',
      '@types/feathersjs__authentication-jwt',
    ];

    // Set up strategies and add dependencies
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
        dependencies.push(`@feathersjs/authentication-${strategy}`); // usually `local`
      }

      if (AUTH_TYPES[strategy]) {
        //devDependencies.push(AUTH_TYPES[strategy]);
        devDependencies = devDependencies.concat(AUTH_TYPES[strategy]);
      }
    });

    // Create the users (entity) service
    if (!generatorsInclude('all')) {
      generator.composeWith(require.resolve('../service'), { props: { name: entity } });
    }

    todos = [
      tmpl([srcPath, 'authentication.ejs'], [libDir, `authentication.${js}`]),
      tmpl([srcPath, 'app.ejs'], [src, `app.${js}`]),
      // todo tmpl([tpl, 'test', 'auth-local.test.ejs'], [testDir, `auth-local.test.${js}`]),
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    writeAuthenticationConfiguration(generator, context);
    generator._packagerInstall(dependencies, { save: true });
    generator._packagerInstall(devDependencies, { saveDev: true });
  }

  // ===== middleware ==============================================================================
  function middleware (generator) {
    if (!specs.middlewares) return;

    todos = [
      tmpl([mwPath, 'index.ejs'], [src, 'middleware', `index.${js}`])
    ];

    Object.keys(specs.middlewares || {}).sort().forEach(mwName => {
      const fileName = specs.middlewares[mwName].kebab;
      todos.push(
        tmpl([mwPath, 'middleware.ejs'], [libDir, 'middleware', `${fileName}.${js}`], true, null, { mwName }),
        tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             false, isJs),
      );
    });

    // Generate modules
    generatorFs(generator, context, todos);
  }

  // ===== graphql =================================================================================
  function graphql (generator) {
    // Custom template context
    context = Object.assign({}, context, {
      name: 'graphql',
      serviceName: 'graphql',

      serviceNameSingular: 'graphql',
      subFolder: '',
      subFolderArray: [],
      subFolderReverse: '',

      path: stripSlashes(specs.graphql.path),
      authentication: false,
      isAuthEntityWithAuthentication: false,
      requiresAuth: specs.graphql.requiresAuth,
      hooks: getHookInfo('graphql'),

      strategy: specs.graphql.strategy,
      graphqlSchemas: serviceSpecsToGraphql(feathersSpecs),
      libDirectory: generator.libDirectory
    });

    // inspector('\n... graphqlSchemas\n', context.graphqlSchemas.split('\n'));
    // inspector('\n... mapping.graphqlService', context.mapping.graphqlService);
    // inspector('\n... feathersSpecs', context.feathersSpecs);

    todos = [
      tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services', `graphql.test.${js}`], true),
      tmpl([qlPath, 'graphql.interfaces.ejs'], [libDir, 'services', 'graphql', 'graphql.interfaces.ts'], false, isJs),

      tmpl([namePath, 'name.hooks.ejs'], [libDir, 'services', 'graphql', `graphql.hooks.${js}`]),
      tmpl([qlPath, 'graphql.schemas.ejs'], [libDir, 'services', 'graphql', `graphql.schemas.${js}`]),
      tmpl([qlPath, 'graphql.service.ejs'], [libDir, 'services', 'graphql', `graphql.service.${js}`]),
      tmpl([qlPath, 'batchloader.resolvers.ejs'], [libDir, 'services', 'graphql', `batchloader.resolvers.${js}`]),
      tmpl([qlPath, 'service.resolvers.ejs'], [libDir, 'services', 'graphql', `service.resolvers.${js}`]),
      tmpl([qlPath, 'sql.execute.custom.ejs'], [libDir, 'services', 'graphql', `sql.execute.custom.${js}`]),
      tmpl([qlPath, 'sql.execute.knex.ejs'], [libDir, 'services', 'graphql', `sql.execute.knex.${js}`]),
      tmpl([qlPath, 'sql.execute.sequelize.ejs'], [libDir, 'services', 'graphql', `sql.execute.sequelize.${js}`]),
      tmpl([qlPath, 'sql.metadata.ejs'], [libDir, 'services', 'graphql', `sql.metadata.${js}`]),
      tmpl([qlPath, 'sql.resolvers.ejs'], [libDir, 'services', 'graphql', `sql.resolvers.${js}`]),
      tmpl([serPath, 'index.ejs'], [libDir, 'services', `index.${js}`]),

      tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             false, isJs),
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator._packagerInstall([
      '@feathers-plus/graphql', // has graphql/graphql as a dependency
      'graphql-resolvers-ast',
      'merge-graphql-schemas'
    ], { save: true });

    generator._packagerInstall([
      '@types/graphql'
    ], { saveDev: true });

    // Determine which hooks are needed
    function getHookInfo() {
      const sc = context.sc;
      const requiresAuth = specs.graphql.requiresAuth;

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

      if (requiresAuth) {
        if (isJs) {
          imports.push(`const { authenticate } = require('@feathersjs/authentication').hooks${sc}`);
        } else {
          imports.push(`import { hooks as authHooks } from '@feathersjs/authentication'${sc}`);
          imports.push(`const { authenticate } = authHooks${sc}`);
        }
      }

      if (requiresAuth) {
        code.before.all.push('authenticate(\'jwt\')');
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
};

function writeAuthenticationConfiguration (generator, context) {
  const config = Object.assign({}, generator._specs._defaultJson);

  config.authentication = {
    secret: generator._specs._isRunningTests
      ? '***** secret generated for tests *****'
      : (config.authentication || {}).secret || crypto.randomBytes(256).toString('hex'),
    strategies: [ 'jwt' ],
    path: '/authentication',
    service: context.kebabEntity,
    jwt: {
      header: { typ: 'access' },
      audience: 'https://yourdomain.com',
      subject: 'anonymous',
      issuer: 'feathers',
      algorithm: 'HS256',
      expiresIn: '1d'
    }
  };

  if (context.strategies.indexOf('local') !== -1) {
    config.authentication.strategies.push('local');
    config.authentication.local = {
      entity: 'user',
      usernameField: 'email',
      passwordField: 'password'
    };
  }

  let includesOAuth = false;

  context.strategies.forEach(strategy => {
    if (OAUTH2_STRATEGY_MAPPINGS[strategy]) {
      const strategyConfig = {
        clientID: `your ${strategy} client id`,
        clientSecret: `your ${strategy} client secret`,
        successRedirect: '/'
      };
      includesOAuth = true;

      if (strategy === 'auth0') {
        strategyConfig.domain = 'mydomain.auth0.com';
        strategyConfig.scopes = [ 'profile' ];
      }

      if (strategy === 'facebook') {
        strategyConfig.scope = ['public_profile', 'email'];
        strategyConfig.profileFields = ['id', 'displayName', 'first_name', 'last_name', 'email', 'gender', 'profileUrl', 'birthday', 'picture', 'permissions'];
      }

      if (strategy === 'google') {
        strategyConfig.scope = ['profile openid email'];
      }

      config.authentication[strategy] = strategyConfig;
    }
  });

  if (includesOAuth) {
    config.authentication.cookie = {
      enabled: true,
      name: 'feathers-jwt',
      httpOnly: false,
      secure: false
    };
  }

  generator._specs._defaultJson = config;

  generator.fs.writeJSON(
    generator.destinationPath('config', 'default.json'),
    config
  );
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
