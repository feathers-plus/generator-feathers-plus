
const makeDebug = require('debug');
const jsonSchemaSeeder = require('json-schema-seeder');
const { join } = require('path');
const doesFileExist = require('../../lib/does-file-exist');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:fakes');

module.exports = {
  fakes,
};

function fakes (generator, props, specs, context, state) {
  debug('fakes()');

  const {
    // Expanded definitions.
    feathersSpecs,
    // Paths.
    appConfigPath,
    // TypeScript & semicolon helpers.
    js,
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
    copy,
    json,
    source,
    stripSlashes,
    // Abbreviations for paths to templates used in building 'todos'.
    tpl,
    configPath,
    src,
    srcPath,
    mwPath,
    serPath,
    namePath,
    qlPath,
    testPath,
    // Other abbreviations using in building 'todos'.
    libDir,
    testDir,
    // Utilities.
    generatorsInclude,
    // Constants.
    WRITE_IF_NEW,
    WRITE_ALWAYS,
    SKIP_WRITE,
    DONT_SKIP_WRITE,
  } = state;

  const schemas = {};
  const adapters = {};

  // Get the app's existing default.js or the default one.
  const existingDefaultJsPath = generator.destinationPath(join(appConfigPath, 'default.js'));
  const defaultJsPath = doesFileExist(existingDefaultJsPath) ?
    existingDefaultJsPath : `${configPath}/default`;

  const defaultJs = require(defaultJsPath);
  if (defaultJs.fakeData && defaultJs.fakeData.noFakesOnAll) return;

  const jssOptions = merge({
    faker: {
      fk: str =>  `->${str}`,
      exp: str => `=>${str}`,
    },
  }, defaultJs.fakeData || {});

  Object.keys(specs.services || {}).forEach(serviceName => {
    const specsServices = specs.services[serviceName];

    if (specsServices.adapter !== 'generic') {
      adapters[serviceName] = specsServices.adapter;
      schemas[serviceName] = feathersSpecs[serviceName];
    }
  });

  const seeder = jsonSchemaSeeder(jssOptions);
  const data = seeder(schemas, adapters, { expContext: jssOptions.expContext });
  const fakeData = jssOptions.postGeneration ?
    jssOptions.postGeneration(data) : data;

  const todos = [
    copy([tpl, '_configs', 'default.js'], [appConfigPath, 'default.js'], WRITE_IF_NEW),
    json(fakeData, ['seeds', 'fake-data.json']),
  ];

  // Generate modules
  generatorFs(generator, context, todos);
}

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
