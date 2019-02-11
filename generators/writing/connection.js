
const makeDebug = require('debug');
const { inspect } = require('util');
const { generatorFs } = require('../../lib/generator-fs');

const debug = makeDebug('generator-feathers-plus:writing:connection');

module.exports = {
  connection,
};

function connection (generator, props, specs, context, state) {
  if (!specs.connections) return;
  debug('connection()');

  const {
    // Paths.
    appConfigPath,
    // TypeScript & semicolon helpers.
    js,
    isJs,
  } = context;

  const {
    // File writing functions.
    tmpl,
    json,
    // Paths to various folders
    tpl,
    src,
    srcPath,
    // Abbreviations using in building 'todos'.
    libDir,
    // Utilities.
    generatorsInclude,
    // Constants
    WRITE_ALWAYS,
  } = state;

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

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}
