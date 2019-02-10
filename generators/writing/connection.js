
const makeDebug = require('debug');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:connection');

module.exports = {
  connection,
};

function connection (generator, props, specs, context, state) {
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

  if (!specs.connections) return;
  debug('connection()');

  // Common abbreviations for building 'todos'.
  const newConfig = specs._defaultJson = Object.assign({}, specs._defaultJson, specs._dbConfigs);
  const connections = specs.connections;
  const _adapters = specs._adapters;
  const isGenerateConnection = generatorsInclude('connection') && !generatorsInclude('service');

  const todos = !Object.keys(connections).length ? [] : [
    json(newConfig,                     [appConfigPath, 'default.json']                    ),
    tmpl([srcPath, 'app.ejs'],          [libDir, `app.${js}`]                              ),
    tmpl([tpl, 'src', 'typings.d.ejs'], [src, 'typings.d.ts'],           WRITE_ALWAYS, isJs),
  ];

  Object.keys(_adapters).sort().forEach(adapter => {
    const connectionsAdapter = adapter === 'sequelize-mssql' ? 'sequelize' : adapter;

    if (connections[connectionsAdapter]) {
      // Force a regen for the adapter selected using `generate connection`.
      const forceWrite = isGenerateConnection && props.adapter === adapter;

      todos.push(
        tmpl(
          [srcPath, '_adapters', _adapters[adapter]],
          [libDir, `${adapter}.${js}`],
          !forceWrite, false, { database: connections[connectionsAdapter].database } )
      );
    }
  });

  // Generate modules
  generatorFs(generator, context, todos);

  // Update dependencies
  generator.dependencies = generator.dependencies || []; // needed
  generator.dependencies = generator.dependencies.concat(specs._connectionDeps);
  generator._packagerInstall(generator.dependencies, { save: true });

  generatorFs(generator, context, todos);
}
