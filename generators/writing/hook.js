
const makeDebug = require('debug');
const { inspect } = require('util');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:hook');

module.exports = {
  hook,
};

function hook (generator, name, props, specs, context, state) {
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

  debug('hook()');
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
