
const crypto = require('crypto');
const makeDebug = require('debug');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:authentication');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

module.exports = {
  authentication,
};

function authentication (generator, justRegen, props, specs, context, state) {
  const AUTH_TYPES = {
    local: '@types/feathersjs__authentication-local',
    auth0: '@types/feathersjs__authentication-oauth2',
    google: '@types/feathersjs__authentication-oauth2',
    facebook: ['@types/passport-facebook', '@types/feathersjs__authentication-oauth2'],
    github: '@types/passport-github',
  };

  /* eslint-disable no-unused-vars */
  const {
    // File writing functions
    tmpl,
    copy,
    json,
    source,
    stripSlashes,
    // Paths to various folders
    tpl,
    configPath,
    src,
    srcPath,
    mwPath,
    serPath,
    namePath,
    qlPath,
    testPath,
    // Abbreviations using in building 'todos'.
    libDir,
    testDir,
    // Utilities
    generatorsInclude,
    // Constants
    WRITE_IF_NEW,
    WRITE_ALWAYS,
  } = state;

  const {
    // Paths to various folders
    appConfigPath,
    // If JS or TS
    js,
    isJs,
    // Abstract .js and .ts statements.
    tplJsOrTs,
    tplJsOnly,
    tplTsOnly,
    tplImports,
    tplModuleExports,
    tplExport,
    // Expanded Feathers service specs
    mapping,
    feathersSpecs,
    // Utilities.
    camelCase,
    kebabCase,
    snakeCase,
    upperFirst,
    merge,
    EOL,
    stringifyPlus
  } = context;
  /* eslint-enable no-unused-vars */

  if (!specs.authentication) return;
  debug('authentication()');

  const entity = specs.authentication.entity;
  const strategies = specs.authentication.strategies;

  // Custom template context
  context = Object.assign({}, context, {
    // PATCH $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // The authentication generation needs to know the path used by then user-entity service,
    // but that service is not configured at that point. So the code guesses the path will be
    // the same as the user-entity name. The generated code won't run right if its different.
    // The generation of the service-entity will call this routine so things are fixed right.
    servicePath: specs.services[entity] ? specs.services[entity].path : entity,
    kebabEntity: entity,
    camelEntity: camelCase(entity),
    oauthProviders: [],
    strategies
  });

  const dependencies = [
    '@feathersjs/authentication',
    '@feathersjs/authentication-jwt'
  ];

  let devDependencies = isJs ? [] : [
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

    if (!isJs && AUTH_TYPES[strategy]) {
      devDependencies = devDependencies.concat(AUTH_TYPES[strategy]);
    }
  });

  // Create the users (entity) service
  if (!justRegen) {
    generator.composeWith(require.resolve('../service'), { props: { name: entity } });
  }

  const todos = [
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

function writeAuthenticationConfiguration (generator, context) {
  const config = Object.assign({}, generator._specs._defaultJson);
  const path = context.servicePath;

  const configAuth = config.authentication = config.authentication || {};
  configAuth.secret = generator._specs._isRunningTests
    ? '***** secret generated for tests *****'
    : (configAuth.secret || crypto.randomBytes(256).toString('hex'));
  configAuth.strategies = [ 'jwt' ];
  configAuth.path = '/authentication';
  configAuth.service = path.substring(0,1) !== '/' ? path : context.servicePath.substring(1);

  configAuth.jwt = configAuth.jwt || {
    header: { typ: 'access' },
    audience: 'https://yourdomain.com',
    subject: 'anonymous',
    issuer: 'feathers',
    algorithm: 'HS256',
    expiresIn: '1d'
  };

  if (context.strategies.indexOf('local') !== -1) {
    configAuth.strategies.push('local');
    configAuth.local = configAuth.local || {
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

      configAuth[strategy] = configAuth[strategy] || strategyConfig;
    }
  });

  if (includesOAuth) {
    configAuth.cookie = configAuth.cookie || {
      enabled: true,
      name: 'feathers-jwt',
      httpOnly: false,
      secure: false
    };
  }

  generator._specs._defaultJson = config;

  generator.fs.writeJSON(
    generator.destinationPath(context.appConfigPath, 'default.json'),
    config
  );
}

// eslint-disable-next-line no-unused-vars
const { inspect } = require('util');
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
