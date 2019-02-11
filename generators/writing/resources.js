
const makeDebug = require('debug');
const { getFragment } = require('../../lib/code-fragments');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:resources');

module.exports = {
  resources,
};

function resources (generator, props, specs, context, state) {
  debug('resources()');

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
    source,
  } = state;

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
