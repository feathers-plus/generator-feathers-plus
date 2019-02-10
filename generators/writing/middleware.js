
const makeDebug = require('debug');
const { inspect } = require('util');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:middleware');

module.exports = {
  middleware,
};

function middleware (generator, props, specs, context, state) {
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
    SKIP_WRITE,
    DONT_SKIP_WRITE,
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

  if (!specs.middlewares) return;
  debug('middleware()');

  const todos = [
    tmpl([mwPath, 'index.ejs'], [src, 'middleware', `index.${js}`])
  ];

  Object.keys(specs.middlewares || {}).sort().forEach(mwName => {
    const fileName = specs.middlewares[mwName].kebab;
    todos.push(
      tmpl([mwPath, 'middleware.ejs'], [libDir, 'middleware', `${fileName}.${js}`], WRITE_IF_NEW, DONT_SKIP_WRITE, { mwName }),
      tmpl([tpl, 'src', 'typings.d.ejs'],     [src, 'typings.d.ts'],                WRITE_ALWAYS, isJs),
    );
  });

  // Generate modules
  generatorFs(generator, context, todos);
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
