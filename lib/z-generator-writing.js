
// Write code based on the app specs

const generatorFs = require('./generator-fs');
const specsExpand = require('./specs-expand');
const makeConfig = require('../generators/app/configs');
const { initSpecs, updateSpecs } = require('./specs');

module.exports = function generatorWriting(generator, section) {
  const props = generator.props;
  props.specs = generator.specs;
  let todos;

  switch (section) {
    case 'app':

      break;
    case 'service':

      break;
    case 'connection':
      updateAppSpecs(generator, 'connections');
      todos = writeConnections(generator, specs);
      break;
    case 'all':

      break;
    default:
      throw new Error(`Unexpected section ${section}. (generatorWriting)`);
  }

  // Generate code
  generatorFs(generator, context, todos);
};

function updateAppSpecs(generator, specSection) {
  updateSpecs(generator.specs, specSection, generator.props);
}

function writeApp(generator) {
  const props = generator.props;
  const specs = props.specs;
  const pkg = generator.pkg = makeConfig.package(generator);

  const context = Object.assign({},
    props,
    {
      hasProvider (name) { return props.providers.indexOf(name) !== -1; },
      requiresAuth: Object.keys(specs.services).some(name => specs.services[name].requiresAuth),
    },
  );

  const todos = [
    // Files which are written only if they don't exist. They are never rewritten (except for default.json)
    { type: 'copy', source: '.editorconfig',  destination: '.editorconfig',  ifNew: true },
    { type: 'copy', source: '.eslintrc.json', destination: '.eslintrc.json', ifNew: true },
    // This name hack is necessary because NPM does not publish `.gitignore` files
    { type: 'copy', source: '_gitignore',     destination: '.gitignore',     ifNew: true },
    { type: 'copy', source: 'LICENSE',        destination: 'LICENSE',        ifNew: true },
    { type: 'tpl',  source: 'README.md.ejs',  destination: 'README.md',      ifNew: true },

    { type: 'json', sourceObj: makeConfig.configDefault(generator),    destination: ['config', 'default.json'],    ifNew: true, ifSkip: specs.options.configJs },
    { type: 'json', sourceObj: makeConfig.configProduction(generator), destination: ['config', 'production.json'], ifNew: true, ifSkip: specs.options.configJs },

    { type: 'copy', source: ['public', 'favicon.ico'], destination: ['public', 'favicon.ico'],  ifNew: true },
    { type: 'copy', source: ['public', 'index.html'],  destination: ['public', 'index.html'],   ifNew: true },

    { type: 'copy', source: ['src', 'hooks', 'logger.js'],     destination: [props.src, 'hooks', 'logger.js'],     ifNew: true },
    { type: 'copy', source: ['src', 'middleware', 'index.js'], destination: [props.src, 'middleware', 'index.js'], ifNew: true },
    { type: 'copy', source: ['src', 'refs', 'common.json'],    destination: [props.src, 'refs', 'common.json'],    ifNew: true },

    { type: 'tpl',  source: ['test', 'app.test.js'], destination: [generator.testDirectory, 'app.test.js'], ifNew: true },

    // Files rewritten every (re)generation.
    { type: 'tpl',  source: ['config', 'production.ejs'], destination: ['config', 'production.js'], ifSkip: !specs.options.configJs },
    { type: 'tpl',  source: ['src', 'index.ejs'],         destination: [props.src, 'index.js'] },

    { type: 'tpl',  source: ['src', 'app.hooks.ejs'],     destination: [props.src, 'app.hooks.js'] },
    { type: 'tpl',  source: ['src', 'channels.ejs'],      destination: [props.src, 'channels.js'] }, // work todo


    { type: 'tpl',  source: ['..', '..', 'templates-shared', 'config.default.ejs'], destination: ['config', 'default.js'], ifSkip: !specs.options.configJs },
    { type: 'tpl',  source: ['..', '..', 'templates-shared', 'src.app.ejs'],        destination: [props.src, 'app.js'] },
    { type: 'tpl',  source: ['..', '..', 'templates-shared', 'services.index.ejs'], destination: [props.src, 'services', 'index.js'] },

    // Last files to write.
    { type: 'json', sourceObj: pkg, destination: ['package.json'], ifNew: true },
  ];

  return todos;
}

// We generate for all connections.
function writeConnections(generator) {
  const props = generator.props;
  let specs = props.specs;

  const context = Object.assign({}, props, {
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
  });

  // Update specs
  updateSpecs(generator.specs, 'connections', props);

  // Expand specs
  specsExpand(specs);

  // List what to generate
  specs = props.specs;
  const connections = specs.connections;
  const _adapters = specs._adapters;

  const newConfig = Object.assign({}, generator.defaultConfig, specs._dbConfigs);

  const todos = !Object.keys(connections).length ? [] : [
    { type: 'json', sourceObj: newConfig,                                           destination: ['config', 'default.json'] },
    { type: 'tpl',  source: ['..', '..', 'templates-shared', `config.default.ejs`], destination: ['config', 'default.js'] },
    { type: 'tpl',  source: ['..', '..', 'templates-shared', `src.app.ejs`],        destination: [generator.libDirectory, 'app.js'] },
  ];

  Object.keys(_adapters).sort().forEach(adapter => {
    todos.push(
      { type: 'copy',  source: _adapters[adapter], destination: [generator.libDirectory, `${adapter}.js`], ifNew: true }
    );
  });

  generator.dependencies = specs._connectionDeps;

  return todos;
}
