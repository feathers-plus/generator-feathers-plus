
const makeDebug = require('debug');
const { inspect } = require('util');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:hook');

module.exports = {
  hook,
};

function hook (generator, name, props, specs, context, state) {
  debug('hook()');

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
    srcPath,
    namePath,
    // Other abbreviations using in building 'todos'.
    libDir,
    // Constants.
    WRITE_IF_NEW,
  } = state;

  const hookSpec = specs.hooks[name];
  const hookFile = hookSpec.fileName;
  let todos;

  if (hookSpec.ifMulti !== 'y') {
    const specsService = specs.services[hookSpec.singleService];
    const sn = specsService.fileName;
    const sfa = generator.getNameSpace(specsService.subFolder)[1];

    todos = [
      tmpl([namePath, 'hooks', 'hook.ejs'], [libDir,  'services', ...sfa, sn, 'hooks', `${hookFile}.${js}`], WRITE_IF_NEW ),
    ];
  } else {
    todos = [
      tmpl([srcPath,  'hooks', 'hook.ejs'], [libDir,  'hooks', `${hookFile}.${js}`],                     WRITE_IF_NEW ),
    ];
  }

  // Generate modules
  generatorFs(generator, context, todos);
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
