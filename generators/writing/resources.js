
const makeDebug = require('debug');
const { getFragment } = require('../../lib/code-fragments');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:resources');

module.exports = {
  resources,
};

function resources (generator, props, specs, context, state) {
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

  debug('resources()');

  if (!specs.requiredCustomResources || !specs.requiredCustomResources.files
    || !specs.requiredCustomResources.files.text) { return; }

  const getFragmenter = getFragment(process.cwd() + '/requiredCustomResources');
  const text = specs.requiredCustomResources.files.text;
  const textPaths = Array.isArray(text) ? text : [text];
  let todos = [];

  // Create new custom text files
  textPaths.forEach(textPath => {
    const code = getFragmenter(textPath) || '';
    todos.push(
      source(code, textPath, true),
    );
  });

  // Generate modules
  generatorFs(generator, context, todos);
}
