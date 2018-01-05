
const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const { join, resolve } = require('path');

const generatorFs = require('../../lib/generator-fs');
const makeConfig = require('./templates/_configs');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const { setPath, updateSpecs } = require('../../lib/specs');

const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

module.exports = function generatorWriting(generator, what) {
  generator.logSteps && console.log(`>>>>> ${what} generator started writing()`);

  // Get expanded app specs
  const { props, _specs: specs } = generator;
  updateSpecs(what, props, `${what} generator`);
  const generators = [...new Set(specs._generators)].sort(); // get unique elements

  // Get expanded Feathers service specs
  const { mapping, feathersSpecs } = serviceSpecsExpand(specs);
  props.feathersSpecs = feathersSpecs;
  props.mapping= mapping;

  // Common abbreviations for building 'todos'.
  const tpl = join(__dirname, 'templates');
  const cfgPath = join(tpl, 'config');
  const src = specs.app.src;
  const srcPath = join(tpl, src);
  const mwPath = join(srcPath, 'middleware');
  const serPath = join(srcPath, 'services');
  const namePath = join(serPath, 'name');
  const qlPath = join(serPath, 'graphql');
  const testPath = join(tpl, 'test');

  const libDir = generator.libDirectory;
  const testDir = generator.testDirectory;
  const js = specs.options.configJs; // todo we remove configJs ?
  let todos;

  // Common template context
  let context = Object.assign({}, props, {
    specs,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
  });

  switch (what) {
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

  generator.logSteps && console.log(
    `>>>>> ${what} generator finished writing()`/*, todos.map(todo => todo.src || todo.obj)*/
  );

  // ===== app =====================================================================================
  function app(generator) {
    // Custom template context
    context = Object.assign({}, context, {
      requiresAuth: false,
    });

    // Custom abbreviations for building 'todos'.
    const pkg = generator.pkg = makeConfig.package(generator);
    const configDefault = makeConfig.configDefault(generator);
    const configProd = makeConfig.configProduction(generator);

    todos = [
      // Files which are written only if they don't exist. They are never rewritten (except for default.json)
      { type: 'copy', src: [tpl, '.editorconfig'],  dest: '.editorconfig',  ifNew: true },
      { type: 'copy', src: [tpl, '.eslintrc.json'], dest: '.eslintrc.json', ifNew: true },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', src: [tpl, '_gitignore'],     dest: '.gitignore',     ifNew: true },
      { type: 'copy', src: [tpl, 'LICENSE'],        dest: 'LICENSE',        ifNew: true },
      { type: 'tpl',  src: [tpl, 'README.md.ejs'],  dest: 'README.md',      ifNew: true },
      { type: 'json', obj: pkg,              dest: 'package.json',   ifNew: true },

      { type: 'json', obj: configDefault,    dest: ['config', 'default.json'],    ifNew: true,  ifSkip: js },
      { type: 'json', obj: configProd,       dest: ['config', 'production.json'], ifNew: true,  ifSkip: js },

      { type: 'copy', src: [tpl, 'public', 'favicon.ico'],      dest: ['public', 'favicon.ico'],    ifNew: true },
      { type: 'copy', src: [tpl, 'public', 'index.html'],       dest: ['public', 'index.html'],     ifNew: true },

      { type: 'tpl',  src: [tpl, 'test', 'app.test.js'],        dest: [testDir, 'app.test.js'],     ifNew: true },

      { type: 'copy', src: [tpl, 'src', 'hooks', 'logger.js'],  dest: [src, 'hooks', 'logger.js'],  ifNew: true },
      { type: 'copy', src: [tpl, 'src', 'refs', 'common.json'], dest: [src, 'refs', 'common.json'], ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [tpl, 'config', 'production.ejs'],   dest: ['config', 'production.js'],  ifSkip: !js },
      { type: 'tpl',  src: [tpl, 'src', 'index.ejs'],           dest: [src, 'index.js'] },

      { type: 'tpl',  src: [tpl, 'src', 'app.hooks.ejs'],       dest: [src, 'app.hooks.js'] },
      { type: 'tpl',  src: [tpl, 'src', 'channels.ejs'],        dest: [src, 'channels.js'] }, // work todo

      { type: 'tpl',  src: [cfgPath, 'default.ejs'], dest: ['config', 'default.js'], ifSkip: !js },
      { type: 'tpl',  src: [mwPath, 'index.ejs'],    dest: [src, 'middleware', 'index.js'] },
      { type: 'tpl',  src: [srcPath, 'app.ejs'],     dest: [src, 'app.js'] },
      { type: 'tpl',  src: [serPath, 'index.ejs'],   dest: [src, 'services', 'index.js'] },
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    // todo dependencies defined in app#prompting()
  }

  // ===== service =================================================================================
  function service(generator) {
    const { adapter, authentication, kebabName, name, path } = props;
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
    const modelTpl = `${adapter}${authentication ? '-user' : ''}.js`;
    const hasModel = fs.existsSync(join(serPath, '_model', modelTpl));

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      generator.composeWith(require.resolve('../connection'), { props: {
        adapter,
        service: name
      } });
    }

    // Custom template context
    context = Object.assign({}, context, {
      libDirectory: generator.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(path),
      serviceModule,
    });

    // Custom abbreviations for building 'todos'.
    const mainFileTpl = fs.existsSync(join(serPath, '_types', `${adapter}.js`)) ?
      [serPath, '_model', '_types', `${adapter}.js`] : [serPath, 'name', 'name.service.ejs'];
    const auth = authentication ? '-auth' : '';
    const asyn = generator.hasAsync ? 'class-async.js' : 'class.js';
    const kn = kebabName;

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: [testPath, 'services', 'name.test.ejs'],
                                            dest: [testDir, 'services', `${kn}.test.js`],        ifNew: true },
      { type: 'tpl',  src: mainFileTpl,     dest: [libDir, 'services', kn, `${kn}.service.js`],  ifNew: true },
      { type: 'tpl',  src: [serPath, '_model', modelTpl],
                                            dest: [libDir, 'models', `${context.modelName}.js`], ifNew: true, ifSkip: !context.modelName },
      { type: 'tpl',  src: [namePath, asyn], dest: [libDir, 'services', kn, `${kn}.class.js`],    ifNew: true, ifSkip: adapter !== 'generic' },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [namePath, 'name.schema.ejs'],       dest: [libDir, 'services', kn, `${kn}.schema.js`] },
      { type: 'tpl',  src: [namePath, 'name.mongoose.ejs'],     dest: [libDir, 'services', kn, `${kn}.mongoose.js`] },
      { type: 'tpl',  src: [namePath, 'name.validate.ejs'],     dest: [libDir, 'services', kn, `${kn}.validate.js`] },
      { type: 'tpl',  src: [namePath, `name.hooks${auth}.ejs`], dest: [libDir, 'services', kn, `${kn}.hooks.js`] },
      { type: 'tpl',  src: [serPath, 'index.ejs'],             dest: [libDir, 'services', 'index.js'] },
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
    // Common abbreviations for building 'todos'.
    const newConfig = Object.assign({}, generator.defaultConfig, specs._dbConfigs);
    const connections = specs.connections;
    const _adapters = specs._adapters;

    const todos = !Object.keys(connections).length ? [] : [
      { type: 'json', obj: newConfig,                dest: ['config', 'default.json'], ifSkip: js },
      { type: 'tpl',  src: [cfgPath, 'default.ejs'], dest: ['config', 'default.js'],   ifSkip: !js },
      { type: 'tpl',  src: [srcPath, 'app.ejs'],     dest: [libDir, 'app.js'] },
    ];

    Object.keys(_adapters).sort().forEach(adapter => { todos.push(
      { type: 'copy', src: [srcPath, _adapters[adapter]],     dest: [libDir, `${adapter}.js`],  ifNew: true }
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
    // Custom template context
    context = Object.assign({}, context, {
      kebabEntity: _.kebabCase(props.entity),
      camelEntity: _.camelCase(props.entity),
      oauthProviders: [],
    });

    const dependencies = [
      '@feathersjs/authentication',
      '@feathersjs/authentication-jwt'
    ];

    // Set up strategies and add dependencies
    props.strategies.forEach(strategy => {
      const oauthProvider = OAUTH2_STRATEGY_MAPPINGS[strategy];

      if (oauthProvider) {
        dependencies.push('@feathersjs/authentication-oauth2');
        dependencies.push(oauthProvider);
        context.oauthProviders.push({
          name: strategy,
          strategyName: `${_.upperFirst(strategy)}Strategy`,
          module: oauthProvider
        });
      } else {
        dependencies.push(`@feathersjs/authentication-${strategy}`);
      }
    });

    // Create the users service
    generator.composeWith(require.resolve('../service'), {
      props: {
        name: context.entity,
        path: `/${context.kebabEntity}`,
        authentication: context
      }
    });

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
    todos = [
      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [mwPath, 'index.ejs'], dest: [src, 'middleware', 'index.js'] },
    ];

    Object.keys(specs.middlewares).sort().forEach(mwName => {
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
    const { adapter, authentication, kebabName, name, path } = props;

    //todo const modelTpl = `${adapter}${generator.props.authentication ? '-user' : ''}.js`;
    //todo const hasModel = fs.existsSync(path.join(templatePath, 'model', modelTpl));

    // Custom template context
    context = Object.assign({}, context, {
      libDirectory: generator.libDirectory,
      //todo modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(generator.props.path),
    });

    // Common abbreviations for building 'todos'.
    //todo const auth = generator.props.authentication ? '.auth' : '';

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: [testPath, 'services', 'name.test.ejs'], dest: [testDir, 'services', `${kebabName}.test.js`], ifNew: true },

      // Files rewritten every (re)generation.
      //todo { type: 'tpl',  src: [qlPath,  `graphql.hooks${auth}.ejs`],   dest: [libDir, 'services', kebabName, `${kebabName}.hooks.js`] },
      { type: 'tpl',  src: [qlPath,  `graphql.hooks.ejs`],   dest: [libDir, 'services', kebabName, `${kebabName}.hooks.js`] },
      { type: 'tpl',  src: [qlPath,  'graphql.schemas.ejs'],        dest: [libDir, 'services', 'graphql', 'graphql.schemas.js'] },
      { type: 'tpl',  src: [qlPath,  'graphql.service.ejs'],        dest: [libDir, 'services', 'graphql', 'graphql.service.js'] },
      { type: 'tpl',  src: [qlPath,  'batchloader.resolvers.ejs'],  dest: [libDir, 'services', 'graphql', 'batchloader.resolvers.js'] },
      { type: 'tpl',  src: [qlPath,  'service.resolvers.ejs'],      dest: [libDir, 'services', 'graphql', 'service.resolvers.js'] },
      { type: 'tpl',  src: [qlPath,  'sql.execute.ejs'],            dest: [libDir, 'services', 'graphql', 'sql.execute.js'] },
      { type: 'tpl',  src: [qlPath,  'sql.metadata.ejs'],           dest: [libDir, 'services', 'graphql', 'sql.metadata.js'] },
      { type: 'tpl',  src: [qlPath,  'sql.resolvers.ejs'],          dest: [libDir, 'services', 'graphql', 'sql.resolvers.js'] },
      { type: 'tpl',  src: [serPath, 'index.ejs'],                  dest: [libDir, 'services', 'index.js'] },
    ];

    // Generate modules
    generatorFs(generator, context, todos);

    // Update dependencies
    generator._packagerInstall([
      'graphql',
      '@feathers-plus/graphql',
      'merge-graphql-schemas',
    ], { save: true });
  }
};

function writeAuthenticationConfiguration(generator, context) {
  const config = Object.assign({}, generator.defaultConfig);

  config.authentication = {
    secret: crypto.randomBytes(256).toString('hex'),
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
