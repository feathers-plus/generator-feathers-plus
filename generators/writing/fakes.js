
const makeDebug = require('debug');
const jsonSchemaSeeder = require('json-schema-seeder');
6
const { join } = require('path');
const doesFileExist = require('../../lib/does-file-exist');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:fakes');

module.exports = {
  fakes,
};

function fakes (generator, props, specs, context, state) {
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

  debug('fakes()');
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
