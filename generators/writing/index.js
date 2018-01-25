
/* eslint-disable no-console */
const crypto = require('crypto');
const deepMerge = require('deepmerge');
const mongoose = require('mongoose');
const { camelCase, kebabCase, upperFirst } = require('lodash');
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
const stringifyPlus = require('../../lib/stringify-plus');
const { updateSpecs } = require('../../lib/specs');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

const nativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId'
};

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

let generators;
function generatorsInclude (name) {
  return generators.indexOf(name) !== -1;
}

module.exports = function generatorWriting (generator, what) {
  // Update specs with answers to prompts
  let { props, _specs: specs } = generator;
  if (what !== 'all') {
    updateSpecs(what, props, `${what} generator`);
  }

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
    specs,
    feathersSpecs,
    mapping,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
    semicolon: specs.options.semicolon ? ';' : '',

    deepMerge: deepMerge,
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

      if (Object.keys(mapping.graphqlService).length || Object.keys(mapping.graphqlSql).length) {
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
    const pkg = generator.pkg = makeConfig.package(generator);
    const configDefault = specs._defaultJson = makeConfig.configDefault(generator);
    const configProd = makeConfig.configProduction(generator);

    todos = [
      copy([tpl, '.editorconfig'], '.editorconfig', true),
      copy([tpl, '.eslintrc.json'], '.eslintrc.json', true),
      // This name hack is necessary because NPM does not publish `.gitignore` files
      copy([tpl, '_gitignore'], '.gitignore', true),
      copy([tpl, 'LICENSE'], 'LICENSE', true),
      tmpl([tpl, 'README.md.ejs'], 'README.md', true),

      json(pkg, 'package.json', true),
      json(configDefault, ['config', 'default.json'], true),
      json(configProd, ['config', 'production.json'], true),

      copy([tpl, 'public', 'favicon.ico'], ['public', 'favicon.ico'], true),
      copy([tpl, 'public', 'index.html'], ['public', 'index.html'], true),

      tmpl([tpl, 'test', 'app.test.ejs'], [testDir, 'app.test.js'], true),

      copy([tpl, 'src', 'hooks', 'logger.js'], [src, 'hooks', 'logger.js'], true),
      copy([tpl, 'src', 'refs', 'common.json'], [src, 'refs', 'common.json'], true),
      copy([tpl, 'src', 'channels.js'], [src, 'channels.js'], true),

      tmpl([tpl, 'src', 'index.ejs'], [src, 'index.js']),
      tmpl([tpl, 'src', 'app.hooks.ejs'], [src, 'app.hooks.js']),


      tmpl([mwPath, 'index.ejs'], [src, 'middleware', 'index.js']),
      tmpl([srcPath, 'app.ejs'], [src, 'app.js']),
      tmpl([serPath, 'index.ejs'], [src, 'services', 'index.js'])
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator.dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/configuration',
      '@feathersjs/express',
      'feathers-hooks-common',
      'serve-favicon',
      'compression',
      'helmet',
      'winston',
      'cors'
    ];

    generator.devDependencies = [
      'eslint',
      'mocha',
      'request',
      'request-promise'
    ];

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
    const adapter = specsService.adapter;
    const path = specsService.path;
    const isAuthEntityWithAuthentication = specsService.isAuthEntity ? specs.authentication : undefined;

    const moduleMappings = {
      generic: `./${kebabName}.class.js`,
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
    const hasModel = existsSync(join(serPath, '_model', modelTpl));

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (!generatorsInclude('all')) {
      if (adapter !== 'generic' && adapter !== 'memory') {
        generator.composeWith(require.resolve('../connection'), { props: {
          adapter,
          service: name
        } });
      }
    }

    // inspector(`\n... specs (generator ${what})`, specs);
    // inspector('\n...mapping', mapping);
    // inspector(`\n... feathersSpecs ${name} (generator ${what})`, feathersSpecs[name]);

    // Custom template context.
    context = Object.assign({}, context, {
      serviceName: name,
      kebabName,
      adapter,
      path: stripSlashes(path),
      authentication: isAuthEntityWithAuthentication,
      isAuthEntityWithAuthentication,
      requiresAuth: specsService.requiresAuth,

      libDirectory: specs.app.src,
      modelName: hasModel ? `${kebabName}.model` : null,
      serviceModule,
      mongoJsonSchema: serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions),
      mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
    });
    context.mongooseSchemaStr = stringifyPlus(context.mongooseSchema, { nativeFuncs });
    context.mongoJsonSchemaStr = stringifyPlus(context.mongoJsonSchema);

    // inspector(`\n... mongooseSchema ${name} (generator ${what})`, context.mongooseSchema);
    // inspector(`\n... context (generator ${what})`, context);

    // Custom abbreviations for building 'todos'.
    const mainFileTpl = existsSync(join(serPath, '_types', `${adapter}.ejs`))
      ? [serPath, '_types', `${adapter}.ejs`] : [serPath, 'name', 'name.service.ejs'];
    const genericFileTpl = generator.hasAsync ? 'name.class-async.js' : 'name.class.js';
    const kn = kebabName;

    todos = [
      tmpl([testPath,   'services', 'name.test.ejs'], [testDir, 'services', `${kn}.test.js`],        true ),
      tmpl([serPath,    '_model', modelTpl],          [libDir, 'models', `${context.modelName}.js`], true, !context.modelName   ),
      tmpl(mainFileTpl,                               [libDir, 'services', kn, `${kn}.service.js`],  true ),
      tmpl([namePath,   genericFileTpl],              [libDir, 'services', kn, `${kn}.class.js`],    true, adapter !== 'generic'),

      tmpl([namePath,   'name.schema.ejs'],           [libDir, 'services', kn, `${kn}.schema.js`]   ),
      tmpl([namePath,   'name.mongo.ejs'],            [libDir, 'services', kn, `${kn}.mongo.js`]    ),
      tmpl([namePath,   'name.mongoose.ejs'],         [libDir, 'services', kn, `${kn}.mongoose.js`] ),
      tmpl([namePath,   'name.validate.ejs'],         [libDir, 'services', kn, `${kn}.validate.js`] ),
      tmpl([namePath,   'name.hooks.ejs'],            [libDir, 'services', kn, `${kn}.hooks.js`]    ),
      tmpl([serPath,    'index.ejs'],                 [libDir, 'services', 'index.js']              )
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }
  }

  // ===== connection ==============================================================================
  function connection (generator) {
    if (!specs.connections) return;

    // Common abbreviations for building 'todos'.
    const newConfig = specs._defaultJson = Object.assign({}, specs._defaultJson, specs._dbConfigs);
    const connections = specs.connections;
    const _adapters = specs._adapters;

    const todos = !Object.keys(connections).length ? [] : [
      json(newConfig, ['config', 'default.json']),
      tmpl([srcPath, 'app.ejs'], [libDir, 'app.js'])
    ];

    Object.keys(_adapters).sort().forEach(adapter => {
      todos.push(
      copy([srcPath, '_adapters', _adapters[adapter]], [libDir, `${adapter}.js`], true)
    );
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

    // Create the users (entity) service
    if (!generatorsInclude('all')) {
      generator.composeWith(require.resolve('../service'), { props: { name: entity } });
    }

    todos = [
      tmpl([srcPath, 'authentication.ejs'], [libDir, 'authentication.js']),
      tmpl([srcPath, 'app.ejs'], [src, 'app.js'])
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    writeAuthenticationConfiguration(generator, context);
    generator._packagerInstall(dependencies, {
      save: true
    });
  }

  // ===== middleware ==============================================================================
  function middleware (generator) {
    if (!specs.middlewares) return;

    todos = [
      tmpl([mwPath, 'index.ejs'], [src, 'middleware', 'index.js'])
    ];

    Object.keys(specs.middlewares || {}).sort().forEach(mwName => {
      const fileName = specs.middlewares[mwName].kebab;
      todos.push(
        tmpl([mwPath, 'middleware.ejs'], [libDir, 'middleware', `${fileName}.js`], true, null, { mwName })
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

      strategy: specs.graphql.strategy,
      graphqlSchemas: serviceSpecsToGraphql(feathersSpecs),
      libDirectory: generator.libDirectory
    });

    todos = [
      tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services', 'graphql.test.js'], true),

      tmpl([namePath, 'name.hooks.ejs'], [libDir, 'services', 'graphql', 'graphql.hooks.js']),
      tmpl([qlPath, 'graphql.schemas.ejs'], [libDir, 'services', 'graphql', 'graphql.schemas.js']),
      tmpl([qlPath, 'graphql.service.ejs'], [libDir, 'services', 'graphql', 'graphql.service.js']),
      tmpl([qlPath, 'batchloader.resolvers.ejs'], [libDir, 'services', 'graphql', 'batchloader.resolvers.js']),
      tmpl([qlPath, 'service.resolvers.ejs'], [libDir, 'services', 'graphql', 'service.resolvers.js']),
      tmpl([qlPath, 'sql.execute.ejs'], [libDir, 'services', 'graphql', 'sql.execute.js']),
      tmpl([qlPath, 'sql.metadata.ejs'], [libDir, 'services', 'graphql', 'sql.metadata.js']),
      tmpl([qlPath, 'sql.resolvers.ejs'], [libDir, 'services', 'graphql', 'sql.resolvers.js']),
      tmpl([serPath, 'index.ejs'], [libDir, 'services', 'index.js'])
    ];

    // Generate modules
    generatorFs(generator, context, todos);
    // Update dependencies
    generator._packagerInstall([
      '@feathers-plus/graphql', // has graphql/graphql as a dependency
      'merge-graphql-schemas'
    ], { save: true });
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

function inspector(desc, obj, depth = 5) { // eslint-disable-line no-unused-vars
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
