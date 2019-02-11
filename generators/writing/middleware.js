
const makeDebug = require('debug');
const { inspect } = require('util');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:middleware');

module.exports = {
  middleware,
};

function middleware (generator, props, specs, context, state) {
  if (!specs.middlewares) return;
  debug('middleware()');

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
    // Abbreviations for paths to templates used in building 'todos'.
    tpl,
    src,
    mwPath,
    // Other abbreviations using in building 'todos'.
    libDir,
    // Constants.
    WRITE_IF_NEW,
    WRITE_ALWAYS,
    DONT_SKIP_WRITE,
  } = state;

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
