
/* eslint-disable no-console */
const crypto = require('crypto');
const deepMerge = require('deepmerge');
const mongoose = require('mongoose');
const { camelCase, kebabCase, upperFirst } = require('lodash');
const { EOL } = require('os');
const { existsSync } = require('fs');
const { join } = require('path');

const generatorFs = require('../../lib/generator-fs');
const makeConfig = require('./templates/_configs');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToGraphql = require('../../lib/service-specs-to-graphql');
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
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId',
};

function tmpl(src, dest, ifNew, ifSkip, ctx) {
  return { type: 'tpl', src, dest, ifNew, ifSkip, ctx };
}

function copy(src, dest, ifNew, ifSkip, ctx) {
  return { type: 'copy', src, dest, ifNew, ifSkip, ctx };
}

function json(obj, dest, ifNew, ifSkip, ctx) {
  return { type: 'json', obj, dest, ifNew, ifSkip, ctx };
}

function stripSlashes(name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}

let generators;
function generatorsInclude(name) {
  return generators.indexOf(name) !== -1;
}

module.exports = function generatorWriting(generator, what) {
  // Update specs with answers to prompts
  let { props, _specs: specs } = generator; // todo remove props
  if (what !== 'all') {
    updateSpecs(what, props, `${what} generator`);
  }

  // Get unique generators which have been run
  generators = [...new Set(specs._generators)].sort();

  // Get latest config as a previously run generator may have updated it.
  generator.defaultConfig = generator.fs.readJSON(generator.destinationPath('config', 'default.json'), {});
  generator.logSteps && console.log(`>>>>> ${what} generator started writing(). Generators:`, generators);

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
  const libDir = generator.libDirectory;
  let todos;

  let testDir = generator.testDirectory;
  if (testDir.charAt(testDir.length - 1) === '/') {
    testDir = testDir.substring(0, testDir.length - 1);
  }

  // Get expanded Feathers service specs
  const { mapping, feathersSpecs } = serviceSpecsExpand(specs);

  // Basic context used with templates.
  let context = Object.assign({}, /*props,*/  { // todo props
    specs,
    feathersSpecs,
    mapping,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },

    deepMerge: deepMerge,
    EOL,
    stringifyPlus,
  });

  inspector('props', props);
  inspector('context', context);

  // Generate what is needed.
  switch (what) {
    case 'all':
      app(generator);

      Object.keys(specs.services || {}).forEach(name => {
        props = { name }; // we depend on no existing, required name prop // todo
        service(generator);
      });

      connection(generator);
      authentication(generator);
      middleware(generator);

      if (Object.keys(mapping.graphqlService).length || Object.keys(mapping.graphqlSql).length) {
        graphql(generator);
      }

      break;
    case 'app':
      app(generator);
      break;
    case 'service':
      service(generator);
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

  generator.logSteps && console.log(`>>>>> ${what} generator finished writing()`);

  // ===== app =====================================================================================
  function app(generator) {
    generator.logSteps && console.log('>>>>> app generator writing()');

    // Custom abbreviations for building 'todos'.
    const pkg = generator.pkg = makeConfig.package(generator);
    const configDefault = makeConfig.configDefault(generator);
    const configProd = makeConfig.configProduction(generator);

    todos = [
      copy([tpl, '.editorconfig'],              '.editorconfig',               true),
      copy([tpl, '.eslintrc.json'],             '.eslintrc.json',              true),
      // This name hack is necessary because NPM does not publish `.gitignore` files
      copy([tpl, '_gitignore'],                 '.gitignore',                  true),
      copy([tpl, 'LICENSE'],                    'LICENSE',                     true),
      tmpl([tpl, 'README.md.ejs'],              'README.md',                   true),

      json(pkg,                                 'package.json',                true),
      json(configDefault,                       ['config', 'default.json'],    true),
      json(configProd,                          ['config', 'production.json'], true),

      copy([tpl, 'public', 'favicon.ico'],      ['public', 'favicon.ico'],     true),
      copy([tpl, 'public', 'index.html'],       ['public', 'index.html'],      true),

      tmpl([tpl, 'test', 'app.test.js'],        [testDir,  'app.test.js'],     true),

      copy([tpl, 'src', 'hooks', 'logger.js'],  [src, 'hooks', 'logger.js'],   true),
      copy([tpl, 'src', 'refs', 'common.json'], [src, 'refs', 'common.json'],  true),

      tmpl([tpl, 'src', 'index.ejs'],           [src, 'index.js']),
      tmpl([tpl, 'src', 'app.hooks.ejs'],       [src, 'app.hooks.js']),
      tmpl([tpl, 'src', 'channels.ejs'],        [src, 'channels.js']), // work todo

      tmpl([mwPath,  'index.ejs'],              [src, 'middleware', 'index.js']),
      tmpl([srcPath, 'app.ejs'],                [src, 'app.js']),
      tmpl([serPath, 'index.ejs'],              [src, 'services', 'index.js']),

      /*
      // Files which are written only if they don't exist. They are never rewritten (except for default.json)
      { type: 'copy', src: [tpl, '.editorconfig'],  dest: '.editorconfig',  ifNew: true },
      { type: 'copy', src: [tpl, '.eslintrc.json'], dest: '.eslintrc.json', ifNew: true },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', src: [tpl, '_gitignore'],     dest: '.gitignore',     ifNew: true },
      { type: 'copy', src: [tpl, 'LICENSE'],        dest: 'LICENSE',        ifNew: true },
      { type: 'tpl',  src: [tpl, 'README.md.ejs'],  dest: 'README.md',      ifNew: true },

      { type: 'json', obj: pkg,              dest: 'package.json',                ifNew: true },
      { type: 'json', obj: configDefault,    dest: ['config', 'default.json'],    ifNew: true },
      { type: 'json', obj: configProd,       dest: ['config', 'production.json'], ifNew: true },

      { type: 'copy', src: [tpl, 'public', 'favicon.ico'],      dest: ['public', 'favicon.ico'],    ifNew: true },
      { type: 'copy', src: [tpl, 'public', 'index.html'],       dest: ['public', 'index.html'],     ifNew: true },

      { type: 'tpl',  src: [tpl, 'test', 'app.test.js'],        dest: [testDir, 'app.test.js'],     ifNew: true },

      { type: 'copy', src: [tpl, 'src', 'hooks', 'logger.js'],  dest: [src, 'hooks', 'logger.js'],  ifNew: true },
      { type: 'copy', src: [tpl, 'src', 'refs', 'common.json'], dest: [src, 'refs', 'common.json'], ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [tpl, 'src', 'index.ejs'],           dest: [src, 'index.js'] },
      { type: 'tpl',  src: [tpl, 'src', 'app.hooks.ejs'],       dest: [src, 'app.hooks.js'] },
      { type: 'tpl',  src: [tpl, 'src', 'channels.ejs'],        dest: [src, 'channels.js'] }, // work todo

      { type: 'tpl',  src: [mwPath, 'index.ejs'],    dest: [src, 'middleware', 'index.js'] },
      { type: 'tpl',  src: [srcPath, 'app.ejs'],     dest: [src, 'app.js'] },
      { type: 'tpl',  src: [serPath, 'index.ejs'],   dest: [src, 'services', 'index.js'] },
      */
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
  function service(generator) {
    generator.logSteps && console.log('>>>>> service generator writing()');

    const { name } = props;

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

    // Custom template context. Include 'props' customized for this service.
    context = Object.assign({}, context, /*props,*/ { // todo props
      serviceName: name,
      kebabName,
      adapter,
      path: stripSlashes(path),
      authentication: isAuthEntityWithAuthentication,
      isAuthEntityWithAuthentication,
      requiresAuth: specsService.requiresAuth,

      libDirectory: generator.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      serviceModule,
      mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
    });
    context.mongooseSchemaStr = stringifyPlus(context.mongooseSchema, { nativeFuncs });

    // Custom abbreviations for building 'todos'.
    const mainFileTpl = existsSync(join(serPath, '_types', `${adapter}.ejs`)) ?
      [serPath, '_types', `${adapter}.ejs`] : [serPath, 'name', 'name.service.ejs'];
    const genericFileTpl = generator.hasAsync ? 'name.class-async.js' : 'name.class.js';
    const kn = kebabName;

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: [testPath, 'services', 'name.test.ejs'], dest: [testDir, 'services', `${kn}.test.js`],
                      ifNew: true },
      { type: 'tpl',  src: [serPath,  '_model',   modelTpl],        dest: [libDir,  'models', `${context.modelName}.js`],
                      ifNew: true, ifSkip: !context.modelName },
      { type: 'tpl',  src: mainFileTpl,                             dest: [libDir,  'services', kn, `${kn}.service.js`],
                      ifNew: true },
      { type: 'tpl',  src: [namePath, genericFileTpl],              dest: [libDir,  'services', kn, `${kn}.class.js`],
                      ifNew: true, ifSkip: adapter !== 'generic' },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [namePath, 'name.schema.ejs'],   dest: [libDir, 'services', kn, `${kn}.schema.js`] },
      { type: 'tpl',  src: [namePath, 'name.mongoose.ejs'], dest: [libDir, 'services', kn, `${kn}.mongoose.js`] },
      { type: 'tpl',  src: [namePath, 'name.validate.ejs'], dest: [libDir, 'services', kn, `${kn}.validate.js`] },
      { type: 'tpl',  src: [namePath, 'name.hooks.ejs'],    dest: [libDir, 'services', kn, `${kn}.hooks.js`] },
      { type: 'tpl',  src: [serPath,  'index.ejs'],         dest: [libDir, 'services', 'index.js'] },
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }
  }

  // ===== connection ==============================================================================
  function connection(generator) {
    generator.logSteps && console.log('>>>>> connection generator writing()');

    if (!specs.connections) return;

    // Common abbreviations for building 'todos'.
    const newConfig = Object.assign({}, generator.defaultConfig, specs._dbConfigs);
    const connections = specs.connections;
    const _adapters = specs._adapters;

    const todos = !Object.keys(connections).length ? [] : [
      { type: 'json', obj: newConfig,                dest: ['config', 'default.json'] },
      { type: 'tpl',  src: [srcPath, 'app.ejs'],     dest: [libDir, 'app.js'] },
    ];

    Object.keys(_adapters).sort().forEach(adapter => { todos.push(
      { type: 'copy', src: [srcPath, '_adapters', _adapters[adapter]], dest: [libDir, `${adapter}.js`],  ifNew: true }
    ); });

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
  function authentication(generator) {
    generator.logSteps && console.log('>>>>> authentication generator writing()');

    if (!specs.authentication) return;

    // Custom template context
    const entity = specs.authentication.entity;
    const strategies = specs.authentication.strategies;

    context = Object.assign({}, context, {
      kebabEntity: kebabCase(entity),
      camelEntity: camelCase(entity),
      oauthProviders: [],
      strategies,
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
      generator.composeWith(require.resolve('../service'), {
        props: {
          name: context.entity,
          path: `/${context.kebabEntity}`,
          authentication: context,
          isAuthEntity: true,
        }
      });
    }

    todos = [
      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [srcPath, 'authentication.ejs'], dest: [libDir, 'authentication.js'] },
      { type: 'tpl',  src: [srcPath, 'app.ejs'],            dest: [src, 'app.js'] },
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
  function middleware(generator) {
    generator.logSteps && console.log('>>>>> middleware generator writing()');

    if (!specs.middlewares) return;

    todos = [
      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [mwPath, 'index.ejs'], dest: [src, 'middleware', 'index.js'] },
    ];

    Object.keys(specs.middlewares || {}).sort().forEach(mwName => {
      const fileName = specs.middlewares[mwName].kebab;
      todos.push(
        { type: 'tpl',  src: [mwPath, 'middleware.ejs'],
                dest: [libDir, 'middleware', `${fileName}.js`], ifNew: true, ctx: { mwName } },
      );
    });

    // Generate modules
    generatorFs(generator, context, todos);
  }

  // ===== graphql =================================================================================
  function graphql(generator) {
    generator.logSteps && console.log('>>>>> graphql generator writing()');

    // Custom template context
    context = Object.assign({}, context, {
      name: 'graphql',
      serviceName : 'graphql',
      path: stripSlashes(specs.graphql.path),
      authentication: specs.graphql.requiresAuth,
      isAuthEntityWithAuthentication: false,

      strategy: specs.graphql.strategy,
      graphqlSchemas: serviceSpecsToGraphql(feathersSpecs),
      libDirectory: generator.libDirectory,
    });

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: [testPath, 'services', 'name.test.ejs'], dest: [testDir, 'services', 'graphql.test.js'], ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [namePath, 'name.hooks.ejs'],            dest: [libDir,  'services', 'graphql', 'graphql.hooks.js'] },
      { type: 'tpl',  src: [qlPath,   'graphql.schemas.ejs'],       dest: [libDir,  'services', 'graphql', 'graphql.schemas.js'] },
      { type: 'tpl',  src: [qlPath,   'graphql.service.ejs'],       dest: [libDir,  'services', 'graphql', 'graphql.service.js'] },
      { type: 'tpl',  src: [qlPath,   'batchloader.resolvers.ejs'], dest: [libDir,  'services', 'graphql', 'batchloader.resolvers.js'] },
      { type: 'tpl',  src: [qlPath,   'service.resolvers.ejs'],     dest: [libDir,  'services', 'graphql', 'service.resolvers.js'] },
      { type: 'tpl',  src: [qlPath,   'sql.execute.ejs'],           dest: [libDir,  'services', 'graphql', 'sql.execute.js'] },
      { type: 'tpl',  src: [qlPath,   'sql.metadata.ejs'],          dest: [libDir,  'services', 'graphql', 'sql.metadata.js'] },
      { type: 'tpl',  src: [qlPath,   'sql.resolvers.ejs'],         dest: [libDir,  'services', 'graphql', 'sql.resolvers.js'] },
      { type: 'tpl',  src: [serPath,  'index.ejs'],                 dest: [libDir,  'services', 'index.js'] },
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator._packagerInstall([
      '@feathers-plus/graphql', // has graphql/graphql as a dependency
      'merge-graphql-schemas',
    ], { save: true });
  }
};

function writeAuthenticationConfiguration(generator, context) {
  const config = Object.assign({}, generator.defaultConfig);

  config.authentication = {
    secret: (generator.defaultConfig.authentication || {}).secret || crypto.randomBytes(256).toString('hex'),
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

      if(strategy === 'auth0') {
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

  generator.fs.writeJSON(
    generator.destinationPath('config', 'default.json'),
    config
  );
}

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
