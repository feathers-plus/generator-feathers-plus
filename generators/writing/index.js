
const fs = require('fs');
const { join } = require('path');

const generatorFs = require('../../lib/generator-fs');
const makeConfig = require('./configs');
const { setPath, updateSpecs } = require('../../lib/specs');

const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = function generatorWriting(generator, what) {
  generator.logSteps && console.log(`>>>>> ${what} generator started writing()`);

  // Get complete app definition specs
  const { props, _specs: specs } = generator;
  console.log('5', props);
  updateSpecs(what, props, `${what} generator`);
  const generators = [...new Set(specs._generators)].sort(); // get unique elements

  // Common abbreviations for building 'todos'.
  const src = specs.app.src;
  const libDir = generator.libDirectory;
  const testDir = generator.testDirectory;
  const shared = 'templates-shared';
  const js = specs.options.configJs; // todo we remove configJs ?
  let todos;

  // Common template context
  let context = Object.assign({}, props, {
    specs,
    hasProvider (name) { return props.providers.indexOf(name) !== -1; },
  });

  switch (what) {
    case 'app':
      app(generator);
      break;
    case 'service':
      service(generator);
      break;
    default:
      throw new Error(`Unexpected generate ${what}. (writing`);
  }

  generator.logSteps && console.log(
    `>>>>> ${what} generator finished writing()`, todos.map(todo => todo.src || todo.obj)
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
      { type: 'copy', src: '.editorconfig',  dest: '.editorconfig',  ifNew: true },
      { type: 'copy', src: '.eslintrc.json', dest: '.eslintrc.json', ifNew: true },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', src: '_gitignore',     dest: '.gitignore',     ifNew: true },
      { type: 'copy', src: 'LICENSE',        dest: 'LICENSE',        ifNew: true },
      { type: 'tpl',  src: 'README.md.ejs',  dest: 'README.md',      ifNew: true },
      { type: 'json', obj: pkg,              dest: 'package.json',   ifNew: true },

      { type: 'json', obj: configDefault,    dest: ['config', 'default.json'],    ifNew: true,  ifSkip: js },
      { type: 'json', obj: configProd,       dest: ['config', 'production.json'], ifNew: true,  ifSkip: js },

      { type: 'copy', src: ['public', 'favicon.ico'],         dest: ['public', 'favicon.ico'],       ifNew: true },
      { type: 'copy', src: ['public', 'index.html'],          dest: ['public', 'index.html'],        ifNew: true },

      { type: 'tpl',  src: ['test', 'app.test.js'],           dest: [testDir, 'app.test.js'],        ifNew: true },

      { type: 'copy', src: ['src', 'hooks', 'logger.js'],     dest: [src, 'hooks', 'logger.js'],     ifNew: true },
      { type: 'copy', src: ['src', 'refs', 'common.json'],    dest: [src, 'refs', 'common.json'],    ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: ['config', 'production.ejs'],      dest: ['config', 'production.js'],     ifSkip: !js },
      { type: 'tpl',  src: ['src', 'index.ejs'],              dest: [src, 'index.js'] },

      { type: 'tpl',  src: ['src', 'app.hooks.ejs'],          dest: [src, 'app.hooks.js'] },
      { type: 'tpl',  src: ['src', 'channels.ejs'],           dest: [src, 'channels.js'] }, // work todo


      { type: 'tpl',  src: ['..', '..', shared, 'config.default.ejs'],  dest: ['config', 'default.js'], ifSkip: !js },
      { type: 'tpl',  src: ['..', '..', shared, 'middleware.index.ejs'], dest: [src, 'middleware', 'index.js'] },
      { type: 'tpl',  src: ['..', '..', shared, 'src.app.ejs'],         dest: [src, 'app.js'] },
      { type: 'tpl',  src: ['..', '..', shared, 'services.index.ejs'],  dest: [src, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);
  }

  // ===== service =================================================================================
  function service(generator) {
    const { adapter, kebabName } = props;
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
    const modelTpl = `${adapter}${props.authentication ? '-user' : ''}.js`;
    const templatePath = join(__dirname, 'templates', 'src', 'services');
    console.log('2', templatePath, modelTpl);
    const hasModel = fs.existsSync(join(templatePath, 'model', modelTpl));

    console.log('hasModel', hasModel);

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      generator.composeWith(require.resolve('../connection'), { props: {
        adapter,
        service: props.name
      } });
    }

    // Custom template context
    context = Object.assign({}, context, {
      libDirectory: generator.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(props.path),
      serviceModule,
    });

    // Custom abbreviations for building 'todos'.
    const mainFileTpl = fs.existsSync(join(templatePath, 'types', `${adapter}.js`)) ?
      ['types', `${adapter}.js`] : ['name.service.ejs'];
    const auth = props.authentication ? '-auth' : '';
    const asyn = generator.hasAsync ? 'class-async.js' : 'class.js';
    const kn = kebabName;
    const at = join('src', 'services');
    const atTest = join(__dirname, 'templates');

    todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      //{ type: 'tpl',  src: [at, 'test', 'name.test.ejs'],
      { type: 'tpl',  src: [atTest, 'test', 'services', 'name.test.ejs'],
                                                    dest: [testDir, 'services', `${kn}.test.js`],        ifNew: true },
      { type: 'tpl',  src: mainFileTpl,             dest: [libDir, 'services', kn, `${kn}.service.js`],  ifNew: true },
      { type: 'tpl',  src: [at, 'model', modelTpl], dest: [libDir, 'models', `${context.modelName}.js`], ifNew: true, ifSkip: !context.modelName },
      { type: 'tpl',  src: [at, asyn],              dest: [libDir, 'services', kn, `${kn}.class.js`],    ifNew: true, ifSkip: adapter !== 'generic' },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: [at, 'name.schema.ejs'],       dest: [libDir, 'services', kn, `${kn}.schema.js`] },
      { type: 'tpl',  src: [at, 'name.mongoose.ejs'],     dest: [libDir, 'services', kn, `${kn}.mongoose.js`] },
      { type: 'tpl',  src: [at, 'name.validate.ejs'],     dest: [libDir, 'services', kn, `${kn}.validate.js`] },
      { type: 'tpl',  src: [at, `name.hooks${auth}.ejs`], dest: [libDir, 'services', kn, `${kn}.hooks.js`] },
      { type: 'tpl',  src: ['..', '..', shared, 'services.index.ejs'], dest: [libDir, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);

    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }
  }

  // ===== app =====================================================================================
  /*
  function app1(generator) {
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
      { type: 'copy', src: '.editorconfig',  dest: '.editorconfig',  ifNew: true },
      { type: 'copy', src: '.eslintrc.json', dest: '.eslintrc.json', ifNew: true },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', src: '_gitignore',     dest: '.gitignore',     ifNew: true },
      { type: 'copy', src: 'LICENSE',        dest: 'LICENSE',        ifNew: true },
      { type: 'tpl',  src: 'README.md.ejs',  dest: 'README.md',      ifNew: true },
      { type: 'json', obj: pkg,              dest: 'package.json',   ifNew: true },

      { type: 'json', obj: configDefault,    dest: ['config', 'default.json'],    ifNew: true,  ifSkip: js },
      { type: 'json', obj: configProd,       dest: ['config', 'production.json'], ifNew: true,  ifSkip: js },

      { type: 'copy', src: ['public', 'favicon.ico'],         dest: ['public', 'favicon.ico'],       ifNew: true },
      { type: 'copy', src: ['public', 'index.html'],          dest: ['public', 'index.html'],        ifNew: true },

      { type: 'tpl',  src: ['test', 'app.test.js'],           dest: [testDir, 'app.test.js'],        ifNew: true },

      { type: 'copy', src: ['src', 'hooks', 'logger.js'],     dest: [src, 'hooks', 'logger.js'],     ifNew: true },
      { type: 'copy', src: ['src', 'refs', 'common.json'],    dest: [src, 'refs', 'common.json'],    ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: ['config', 'production.ejs'],      dest: ['config', 'production.js'],     ifSkip: !js },
      { type: 'tpl',  src: ['src', 'index.ejs'],              dest: [src, 'index.js'] },

      { type: 'tpl',  src: ['src', 'app.hooks.ejs'],          dest: [src, 'app.hooks.js'] },
      { type: 'tpl',  src: ['src', 'channels.ejs'],           dest: [src, 'channels.js'] }, // work todo


      { type: 'tpl',  src: ['..', '..', shared, 'config.default.ejs'],  dest: ['config', 'default.js'], ifSkip: !js },
      { type: 'tpl',  src: ['..', '..', shared, 'middleware.index.ejs'], dest: [src, 'middleware', 'index.js'] },
      { type: 'tpl',  src: ['..', '..', shared, 'src.app.ejs'],         dest: [src, 'app.js'] },
      { type: 'tpl',  src: ['..', '..', shared, 'services.index.ejs'],  dest: [src, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);
  }
  */
};