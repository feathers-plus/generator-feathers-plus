
const makeDebug = require('debug');
const { inspect } = require('util');
const serviceSpecsToGraphql = require('../../lib/service-specs-to-graphql');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:graphql');

module.exports = {
  graphql,
};

function graphql (generator, props, specs, context, state) {
  debug('graphql()');

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
    serPath,
    namePath,
    qlPath,
    testPath,
    // Other abbreviations using in building 'todos'.
    libDir,
    testDir,
    // Constants.
    WRITE_IF_NEW,
    WRITE_ALWAYS,
  } = state;

  // Custom template context
  const context1 = Object.assign({}, context, {
    name: 'graphql',
    serviceName: 'graphql',
    kebabName: 'graphql',

    serviceNameSingular: 'graphql',
    subFolder: '',
    subFolderArray: [],
    subFolderReverse: '',

    graphqlTypeName: undefined,

    path: stripSlashes(specs.graphql.path),
    authentication: false,
    isAuthEntityWithAuthentication: false,
    requiresAuth: specs.graphql.requiresAuth,
    hooks: getHookInfo('graphql', context.sc),
    _hooks: specs._hooks['graphql'] || [],

    strategy: specs.graphql.strategy,
    graphqlSchemas: serviceSpecsToGraphql(feathersSpecs),
    libDirectory: generator.libDirectory
  });

  const todos = [
    tmpl([testPath, 'services', 'name.test.ejs'], [testDir, 'services', `graphql.test.${js}`], WRITE_IF_NEW),
    tmpl([qlPath, 'graphql.interfaces.ejs'], [libDir, 'services', 'graphql', 'graphql.interfaces.ts'], WRITE_ALWAYS, isJs),

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

    tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],             WRITE_ALWAYS, isJs),
  ];

  // Generate modules
  generatorFs(generator, context1, todos);

  // Update dependencies
  generator._packagerInstall([
    '@feathers-plus/graphql', // has graphql/graphql as a dependency
    'graphql-resolvers-ast',
    'merge-graphql-schemas'
  ], { save: true });

  if (!isJs) {
    generator._packagerInstall([
      '@types/graphql'
    ], { saveDev: true });
  }

  // Determine which hooks are needed
  function getHookInfo(name, sc) {
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

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
