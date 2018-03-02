
/* eslint-disable no-console */
const crypto = require('crypto');
const merge = require('lodash.merge');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const { camelCase, kebabCase, snakeCase, upperFirst } = require('lodash');
const { EOL } = require('os');
const { existsSync } = require('fs');
const { inspect } = require('util');
const { join } = require('path');

const generatorFs = require('../../lib/generator-fs');
const makeConfig = require('./templates/_configs');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToGraphql = require('../../lib/service-specs-to-graphql');
const serviceSpecsToMongoJsonSchema = require('../../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../../lib/service-specs-to-sequelize');
const stringifyPlus = require('../../lib/stringify-plus');

const { updateSpecs } = require('../../lib/specs');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

const STRATEGY_TYPES = {
  local: '@types/feathersjs__authenticaltion-local',
  auth0: '@types/feathersjs__authenticaltion-oauth2',
  google: '@types/feathersjs__authenticaltion-google',
  facebook: '@types/feathersjs__authenticaltion-facebook',
  github: '@types/feathersjs__authenticaltion-github',
};

const mongooseNativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId'
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

// Abstract creating import and export statements for .js and .ts
function abstractTs(specs) {
  const ifTs = specs.options.ts;
  const sc = specs.options.semicolons ? ';' : '';

  return {
    tplJsOrTs: (value, valueTs) => ifTs ? valueTs : value,
    tplTsOnly: lines => {
      lines = Array.isArray(lines) ? lines : [lines];

      return ifTs ? lines.join(EOL) : '';
    },
    tplImports: (vars, module, format) => {
      if (!ifTs) return `const ${vars} = require('${module || vars}')${sc}`;

      if (format === 'req') return `import ${vars} = require('${module || vars}')${sc}`;
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
  const { tplJsOrTs, tplTsOnly, tplImports, tplModuleExports, tplExport } = abstractTs(specs);

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

    // TypeScript & semicolon helpers.
    js,
    isJs,
    sc: specs.options.semicolons ? ';' : '',
    lintRule: isJs ? 'eslint ' : 'tslint:',
    lintDisable: isJs ?  'eslint-disable' : 'tslint:disable',
    lintDisableNextLine: isJs ?  'eslint-disable-next-line' : 'tslint:disable-next-line',
    tplJsOrTs,
    tplTsOnly,
    tplImports,
    tplModuleExports,
    tplExport,

    // Utilities.
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
      eslintrc = generator.fs.readJSON(join(tpl, '.eslintrc.json'), {});
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

    // Modules to generate
    todos = [
      copy([tpl, '.editorconfig'], '.editorconfig', true),
      // This name hack is necessary because NPM does not publish `.gitignore` files
      copy([tpl, '_gitignore'], '.gitignore', true),
      copy([tpl, 'LICENSE'], 'LICENSE', true),
      tmpl([tpl, 'README.md.ejs'], 'README.md', true),

      copy([tpl, 'public', 'favicon.ico'], ['public', 'favicon.ico'], true),
      copy([tpl, 'public', 'index.html'], ['public', 'index.html'], true),

      tmpl([tpl, 'test', 'app.test.ejs'], [testDir, `app.test.${js}`], true),

      tmpl([tpl, 'src', 'hooks', 'logger.ejs'], [src, 'hooks', `logger.${js}`], true),
      copy([tpl, 'src', 'refs', 'common.json'], [src, 'refs', 'common.json'], true),
      tmpl([tpl, 'src', 'channels.ejs'], [src, `channels.${js}`], true),

      json(pkg, 'package.json'),
      json(configDefault, ['config', 'default.json']),
      json(configProd, ['config', 'production.json']),

      tmpl([tpl, 'src', 'index.ejs'], [src, `index.${js}`]),
      tmpl([tpl, 'src', 'app.hooks.ejs'], [src, `app.hooks.${js}`]),

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
        copy([tpl, 'tsconfig.json'], 'tsconfig.json', true),
        copy([tpl, 'tsconfig.test.json'], 'tsconfig.test.json', true),
      );
    }

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator.dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/configuration',
      '@feathersjs/express',
      'compression',
      'cors',
      'feathers-hooks-common',
      'helmet',
      'lodash.merge',
      'serve-favicon',
      'winston',
    ];

    generator.devDependencies = [
      'request',
      'request-promise'
    ];

    if (isJs) {
      generator.devDependencies = generator.devDependencies.concat([
        'eslint',
        'mocha',
      ]);
    } else {
      generator.devDependencies = generator.devDependencies.concat([
        'ts-mocha',
        'ts-node',
        'tslint',
        'typescript',
        '@types/feathersjs__configuration',
        '@types/feathersjs__errors',
        '@types/feathersjs__feathers',
        '@types/winston',
        '@types/mocha',
        '@types/request-promise',
        // with express
        '@types/feathersjs__express',
        '@types/compression',
        '@types/cors',
        '@types/helmet',
        '@types/serve-favicon',
        '@types/lodash.merge',
      ]);

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

    generator._packagerInstall(generator.dependencies, {
      save: true
    });

    generator._packagerInstall(generator.devDependencies, {
      saveDev: true
    });
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
      generic: `./${kebabName}.class.${js}`,
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
    const strategies = (specs.authentication || {}).strategies || [];

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
    });
    context.mongoJsonSchemaStr = stringifyPlus(context.mongoJsonSchema);
    context.mongooseSchemaStr = stringifyPlus(context.mongooseSchema, { nativeFuncs: mongooseNativeFuncs });

    const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);
    context.sequelizeSchema = seqModel;
    context.sequelizeFks = seqFks;
    context.sequelizeSchemaStr = stringifyPlus(context.sequelizeSchema, { nativeFuncs: sequelizeNativeFuncs });

    // inspector(`\n... mongooseSchema ${name} (generator ${what})`, context.mongooseSchema);
    // inspector(`\n... mongooseSchemaStr ${name} (generator ${what})`, context.mongooseSchemaStr.split('\n'));
    // inspector(`\n... sequelizeSchema ${name} (generator ${what})`, context.sequelizeSchema);
    // inspector(`\n... sequelizeSchemaStr ${name} (generator ${what})`, context.sequelizeSchemaStr.split('\n'));
    // inspector(`\n... sequelizeFks ${name} (generator ${what})`, context.sequelizeFks);
    // inspector(`\n... context (generator ${what})`, context);

    const dependencies = ['ajv'];

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
        dependencies.push(`@feathersjs/authentication-${strategy}`);
      }
    });

    // Custom abbreviations for building 'todos'.
    const serviceTpl = existsSync(join(serPath, '_service', `name.service-${adapter}.ejs`))
      ? `name.service-${adapter}.ejs` : 'name.service.ejs';
    const genericServiceTpl = generator.hasAsync ? 'name.class-async.ejs' : 'name.class.ejs';
    const kn = kebabName;

    todos = [
      tmpl([testPath,   'services', 'name.test.ejs'], [testDir, 'services', `${kn}.test.${js}`],        ),
      tmpl([srcPath,    '_model',   modelTpl],        [libDir, 'models', `${context.modelName}.${js}`], false, !context.modelName    ),
      tmpl([serPath,    '_service', serviceTpl],      [libDir, 'services', kn, `${kn}.service.${js}`],  ),
      tmpl([namePath,   genericServiceTpl],           [libDir, 'services', kn, `${kn}.class.${js}`],    false, adapter !== 'generic' ),

      // lib/service-specs-combine.js runs a `require` on src/services/name/name.schema.js
      tmpl([namePath,   'name.schema.ejs'],           [libDir, 'services', kn, `${kn}.schema.js`]       ),
      tmpl([namePath,   'name.mongo.ejs'],            [libDir, 'services', kn, `${kn}.mongo.${js}`]     ),
      tmpl([namePath,   'name.mongoose.ejs'],         [libDir, 'services', kn, `${kn}.mongoose.${js}`]  ),
      //tmpl([namePath,   'name.sequelize.ejs'],        [libDir, 'services', kn, `${kn}.sequelize.${js}`] ),
      tmpl([namePath,   'name.validate.ejs'],         [libDir, 'services', kn, `${kn}.validate.${js}`]  ),
      tmpl([namePath,   'name.hooks.ejs'],            [libDir, 'services', kn, `${kn}.hooks.${js}`]     ),
      tmpl([serPath,    'index.ejs'],                 [libDir, 'services', `index.${js}`]               )
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }

    // Update dependencies
    if (serviceModule.charAt(0) !== '.') {
      dependencies.push(serviceModule);
    }

    generator._packagerInstall(dependencies, { save: true });

    // Determine which hooks are needed
    function getHookInfo(name) {
      const sc = context.sc;
      const isMongo = (mapping.feathers[name] || {}).adapter === 'mongodb';
      const requiresAuth = specsService.requiresAuth;

      const hooks = [ 'iff' ];
      const imports = [
        isJs ?
          `const commonHooks = require('feathers-hooks-common')${sc}` :
          `import * as commonHooks from 'feathers-hooks-common'${sc}`
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
          imports.push('// eslint-disable-next-line no-unused-vars');

          if (isJs) {
            imports.push(`const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks${sc}`);
          } else {
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
        imports.push(`const { ObjectID } = require('mongodb')${sc}`);
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
      tmpl([srcPath, 'app.ejs'], [libDir, `app.${js}`])
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
    generator._packagerInstall(generator.dependencies, {
      save: true
    });

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

    const devDependencies = [
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

      devDependencies.push(STRATEGY_TYPES[strategy]);
    });

    // Create the users (entity) service
    if (!generatorsInclude('all')) {
      generator.composeWith(require.resolve('../service'), { props: { name: entity } });
    }

    todos = [
      tmpl([srcPath, 'authentication.ejs'], [libDir, `authentication.${js}`]),
      tmpl([srcPath, 'app.ejs'], [src, `app.${js}`])
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    writeAuthenticationConfiguration(generator, context);

    generator._packagerInstall(dependencies, {
      save: true
    });

    generator._packagerInstall(devDependencies, {
      saveDev: true
    });
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
        tmpl([mwPath, 'middleware.ejs'], [libDir, 'middleware', `${fileName}.${js}`], true, null, { mwName })
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
      path: stripSlashes(specs.graphql.path),
      authentication: false,
      isAuthEntityWithAuthentication: false,
      requiresAuth: specs.graphql.requiresAuth,
      hooks: getHookInfo('graphql'),

      strategy: specs.graphql.strategy,
      graphqlSchemas: serviceSpecsToGraphql(feathersSpecs),
      libDirectory: generator.libDirectory
    });

    todos = [
      tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services', `graphql.test.${js}`], true),

      tmpl([namePath, 'name.hooks.ejs'], [libDir, 'services', 'graphql', `graphql.hooks.${js}`]),
      tmpl([qlPath, 'graphql.schemas.ejs'], [libDir, 'services', 'graphql', `graphql.schemas.${js}`]),
      tmpl([qlPath, 'graphql.service.ejs'], [libDir, 'services', 'graphql', `graphql.service.${js}`]),
      tmpl([qlPath, 'batchloader.resolvers.ejs'], [libDir, 'services', 'graphql', `batchloader.resolvers.${js}`]),
      tmpl([qlPath, 'service.resolvers.ejs'], [libDir, 'services', 'graphql', `service.resolvers.${js}`]),
      tmpl([qlPath, 'sql.execute.ejs'], [libDir, 'services', 'graphql', `sql.execute.${js}`]),
      tmpl([qlPath, 'sql.metadata.ejs'], [libDir, 'services', 'graphql', `sql.metadata.${js}`]),
      tmpl([qlPath, 'sql.resolvers.ejs'], [libDir, 'services', 'graphql', `sql.resolvers.${js}`]),
      tmpl([serPath, 'index.ejs'], [libDir, 'services', `index.${js}`])
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator._packagerInstall([
      '@feathers-plus/graphql', // has graphql/graphql as a dependency
      'graphql-resolvers-ast',
      'merge-graphql-schemas'
    ], { save: true });

    // Determine which hooks are needed
    function getHookInfo() {
      const sc = context.sc;
      const requiresAuth = specs.graphql.requiresAuth;

      const hooks = [ 'iff' ];
      const imports = [
        `const commonHooks = require(\'feathers-hooks-common\')${sc}`
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
        imports.push(`const { authenticate } = require('@feathersjs/authentication').hooks${sc}`);
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
function inspector(desc, obj, depth = 5) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
