
const fs = require('fs');
const { join, resolve } = require('path');

const generatorFs = require('../../lib/generator-fs');
const makeConfig = require('./configs');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const { setPath, updateSpecs } = require('../../lib/specs');

const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = function generatorWriting(generator, what) {
  generator.logSteps && console.log(`>>>>> ${what} generator started writing()`);

  // Get expanded app specs
  const { props, _specs: specs } = generator;
  updateSpecs(what, props, `${what} generator`);
  const generators = [...new Set(specs._generators)].sort(); // get unique elements

  // Get expanded Feathers service specs
  const { mapping, feathersSpecs } = serviceSpecsExpand(specs);
  props.feathersSpecs = feathersSpecs;
  props.mapping= mapping;

  // Common abbreviations for building 'todos'.
  const tpl = join(__dirname, 'templates');
  const src = specs.app.src;
  const srcPath = join(tpl, src);
  const serPath = join(srcPath, 'services');
  const testPath = join(tpl, 'test');
  const sharedTpl = resolve(__dirname, '..', 'templates-shared');

  const libDir = generator.libDirectory;
  const testDir = generator.testDirectory;
  const js = specs.options.configJs; // todo we remove configJs ?
  let todos;

  // Common template context
  let context = Object.assign({}, props, {
    specs,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
  });

  switch (what) {
    case 'app':
      app(generator);
      break;
    case 'service':
      service(generator);
      break;
    case 'connection':
      connection(generator);
      break;
    default:
      throw new Error(`Unexpected generate ${what}. (writing`);
  }

  generator.logSteps && console.log(
    `>>>>> ${what} generator finished writing()`/*, todos.map(todo => todo.src || todo.obj)*/
  );

  // ===== app =====================================================================================
  function app(generator) {
    // Custom template context
    context = Object.assign({}, context, {
      requiresAuth: false,
    });

    // Custom abbreviations for building 'todos'.
    const pkg = generator.pkg = makeConfig.package(generator);
    const configDefault = makeConfig.configDefault(generator);
    const configProd = makeConfig.configProduction(generator);

    todos = [
      // Files which are written only if they don't exist. They are never rewritten (except for default.json)
      { type: 'copy', src: [tpl, '.editorconfig'],  dest: '.editorconfig',  ifNew: true },
      { type: 'copy', src: [tpl, '.eslintrc.json'], dest: '.eslintrc.json', ifNew: true },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', src: [tpl, '_gitignore'],     dest: '.gitignore',     ifNew: true },
      { type: 'copy', src: [tpl, 'LICENSE'],        dest: 'LICENSE',        ifNew: true },
      { type: 'tpl',  src: [tpl, 'README.md.ejs'],  dest: 'README.md',      ifNew: true },
      { type: 'json', obj: pkg,              dest: 'package.json',   ifNew: true },

      { type: 'json', obj: configDefault,    dest: ['config', 'default.json'],    ifNew: true,  ifSkip: js },
      { type: 'json', obj: configProd,       dest: ['config', 'production.json'], ifNew: true,  ifSkip: js },

      { type: 'copy', src: [tpl, 'public', 'favicon.ico'],         dest: ['public', 'favicon.ico'],       ifNew: true },
      { type: 'copy', src: [tpl, 'public', 'index.html'],          dest: ['public', 'index.html'],        ifNew: true },

      { type: 'tpl',  src: [tpl, 'test', 'app.test.js'],           dest: [testDir, 'app.test.js'],        ifNew: true },

      { type: 'copy', src: [tpl, 'src', 'hooks', 'logger.js'],     dest: [src, 'hooks', 'logger.js'],     ifNew: true },
      { type: 'copy', src: [tpl, 'src', 'refs', 'common.json'],    dest: [src, 'refs', 'common.json'],    ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [tpl, 'config', 'production.ejs'],      dest: ['config', 'production.js'],     ifSkip: !js },
      { type: 'tpl',  src: [tpl, 'src', 'index.ejs'],              dest: [src, 'index.js'] },

      { type: 'tpl',  src: [tpl, 'src', 'app.hooks.ejs'],          dest: [src, 'app.hooks.js'] },
      { type: 'tpl',  src: [tpl, 'src', 'channels.ejs'],           dest: [src, 'channels.js'] }, // work todo


      { type: 'tpl',  src: [sharedTpl, 'config.default.ejs'],  dest: ['config', 'default.js'], ifSkip: !js },
      { type: 'tpl',  src: [sharedTpl, 'middleware.index.ejs'], dest: [src, 'middleware', 'index.js'] },
      { type: 'tpl',  src: [sharedTpl, 'src.app.ejs'],         dest: [src, 'app.js'] },
      { type: 'tpl',  src: [sharedTpl, 'services.index.ejs'],  dest: [src, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);
  }

  // ===== service =================================================================================
  function service(generator) {
    const { adapter, authentication, kebabName, name, path } = props;
    const moduleMappings = {
      generic: `./${kebabName}.class.js`,
      memory: 'feathers-memory',
      nedb: 'feathers-nedb',
      mongodb: 'feathers-mongodb',
      mongoose: 'feathers-mongoose',
      sequelize: 'feathers-sequelize',
      knex: 'feathers-knex',
      rethinkdb: 'feathers-rethinkdb'
    };
    const serviceModule = moduleMappings[adapter];
    const modelTpl = `${adapter}${authentication ? '-user' : ''}.js`;
    const hasModel = fs.existsSync(join(serPath, '_model', modelTpl));

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      generator.composeWith(require.resolve('../connection'), { props: {
        adapter,
        service: name
      } });
    }

    // Custom template context
    context = Object.assign({}, context, {
      libDirectory: generator.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(path),
      serviceModule,
    });

    // Custom abbreviations for building 'todos'.
    const mainFileTpl = fs.existsSync(join(serPath, '_types', `${adapter}.js`)) ?
      [serPath, '_model', '_types', `${adapter}.js`] : [serPath, 'name.service.ejs'];
    const auth = authentication ? '-auth' : '';
    const asyn = generator.hasAsync ? 'class-async.js' : 'class.js';
    const kn = kebabName;

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: [testPath, 'services', 'name.test.ejs'],
                                            dest: [testDir, 'services', `${kn}.test.js`],        ifNew: true },
      { type: 'tpl',  src: mainFileTpl,     dest: [libDir, 'services', kn, `${kn}.service.js`],  ifNew: true },
      { type: 'tpl',  src: [serPath, '_model', modelTpl],
                                            dest: [libDir, 'models', `${context.modelName}.js`], ifNew: true, ifSkip: !context.modelName },
      { type: 'tpl',  src: [serPath, asyn], dest: [libDir, 'services', kn, `${kn}.class.js`],    ifNew: true, ifSkip: adapter !== 'generic' },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [serPath, 'name.schema.ejs'],       dest: [libDir, 'services', kn, `${kn}.schema.js`] },
      { type: 'tpl',  src: [serPath, 'name.mongoose.ejs'],     dest: [libDir, 'services', kn, `${kn}.mongoose.js`] },
      { type: 'tpl',  src: [serPath, 'name.validate.ejs'],     dest: [libDir, 'services', kn, `${kn}.validate.js`] },
      { type: 'tpl',  src: [serPath, `name.hooks${auth}.ejs`], dest: [libDir, 'services', kn, `${kn}.hooks.js`] },
      { type: 'tpl',  src: [sharedTpl, 'services.index.ejs'],  dest: [libDir, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);

    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }
  }

  // ===== connection ==============================================================================
  function connection(generator) {
    // Custom abbreviations.
    const newConfig = Object.assign({}, generator.defaultConfig, specs._dbConfigs);
    const connections = specs.connections;
    const _adapters = specs._adapters;

    const todos = !Object.keys(connections).length ? [] : [
      { type: 'json', obj: newConfig,                         dest: ['config', 'default.json'], ifSkip: js },
      { type: 'tpl',  src: [sharedTpl, `config.default.ejs`], dest: ['config', 'default.js'],   ifSkip: !js },
      { type: 'tpl',  src: [sharedTpl, `src.app.ejs`],        dest: [libDir, 'app.js'] },
    ];

    Object.keys(_adapters).sort().forEach(adapter => { todos.push(
      { type: 'copy', src: [srcPath, _adapters[adapter]],     dest: [libDir, `${adapter}.js`],  ifNew: true }
    ); });

    // Generate
    generatorFs(generator, context, todos);

    // Update dependencies
    generator.dependencies = generator.dependencies.concat(specs._connectionDeps);

    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    generator._packagerInstall(generator.dependencies, {
      save: true
    });

    generatorFs(generator, context, todos);
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
