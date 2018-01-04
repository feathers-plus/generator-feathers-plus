const Generator = require('../../lib/generator');
const path = require('path');
// todo const makeConfig = require('./configs');
const { kebabCase } = require('lodash');

const generatorFs = require('../../lib/generator-fs');
const specsExpand = require('../../lib/specs-expand');
const { refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');

const generatorWriting = require('../writing');

module.exports = class AppGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    initSpecs('app');
    this.fragments = refreshCodeFragments();

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      src: this._specs.app.src || (this.pkg.directories && this.pkg.directories.lib),
    };

    this.dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/configuration',
      '@feathersjs/express',
      'feathers-hooks-common',
      'serve-favicon',
      'compression',
      'helmet',
      'winston',
      'cors'
    ];

    this.devDependencies = [
      'eslint',
      'mocha',
      'request',
      'request-promise'
    ];
  }

  prompting () {
    const { props, _specs: specs } = this;

    const dependencies = this.dependencies.concat(this.devDependencies)
      .concat([
        '@feathersjs/express',
        '@feathersjs/socketio',
        '@feathersjs/primus'
      ]);

    const prompts = [{
      name: 'name',
      message: 'Project name',
      when: !this.pkg.name,
      default: this.props.name,
      filter: kebabCase,
      validate (input) {
        // The project name can not be the same as any of the dependencies
        // we are going to install
        const isSelfReferential = dependencies.some(dependency => {
          const separatorIndex = dependency.indexOf('@');
          const end = separatorIndex !== -1 ? separatorIndex : dependency.length;
          const dependencyName = dependency.substring(0, end);

          return dependencyName === input;
        });

        if (isSelfReferential) {
          return `Your project can not be named '${input}' because the '${input}' package will be installed as a project dependency.`;
        }

        return true;
      }
    }, {
      name: 'description',
      message: 'Description',
      when: !this.pkg.name, // Initial generate if name undefined.
      default: this.props.description || `Project ${kebabCase(this.props.name)}`,
    }, {
      name: 'src',
      message: 'What folder should the source files live in?',
      default: specs.app.src || 'src',
      when: !specs.app.src && !(this.pkg.directories && this.pkg.directories.lib)
    }, {
      name: 'packager',
      type: 'list',
      message: 'Which package manager are you using (has to be installed globally)?',
      default: specs.app.packager || 'npm@>= 3.0.0',
      choices: [{
        name: 'npm',
        value: 'npm@>= 3.0.0'
      }, {
        name: 'Yarn',
        value: 'yarn@>= 0.18.0'
      }]
    }, {
      type: 'checkbox',
      name: 'providers',
      message: 'What type of API are you making?',
      choices: [{
        name: 'REST',
        value: 'rest',
        checked: specs.app.providers ? specs.app.providers.indexOf('rest') !== -1 : true,
      }, {
        name: 'Realtime via Socket.io',
        value: 'socketio',
        checked: specs.app.providers ? specs.app.providers.indexOf('socketio') !== -1 : true,
      }, {
        name: 'Realtime via Primus',
        value: 'primus',
        checked: specs.app.providers ? specs.app.providers.indexOf('primus') !== -1 : false,
      }],
      validate (input) {
        if (input.indexOf('primus') !== -1 && input.indexOf('socketio') !== -1) {
          return 'You can only pick SocketIO or Primus, not both.';
        }

        return true;
      }
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
      this.logSteps && console.log('>>>>> app generator finished prompting()');
    });
  }

  writing () {
    generatorWriting(this, 'app');
    /*
    const generator = this;
    generator.logSteps && console.log('>>>>> app generator started writing()');

    const { props, _specs: specs } = generator;
    const pkg = generator.pkg = makeConfig.package(generator);

    const context = Object.assign({},
      props,
      {
        specs,
        hasProvider (name) { return props.providers.indexOf(name) !== -1; },
        requiresAuth: false,
      },
    );

    updateSpecs('app', props, 'app generator');
    //specsExpand(specs);

    // Common abbreviations for building 'todos'.
    const src = specs.app.src;
    const libDir = generator.libDirectory;
    const testDir = generator.testDirectory;
    const shared = 'templates-shared';
    const js = specs.options.configJs;
    // Custom abbreviations.
    const configDefault = makeConfig.configDefault(generator);
    const configProd = makeConfig.configProduction(generator);

    const todos = [
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
      // todo { type: 'copy', src: ['src', 'middleware', 'index.js'], dest: [src, 'middleware', 'index.js'], ifNew: true },
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

    generator.logSteps && console.log('>>>>> app generator finished writing()', todos.map(todo => todo.src || todo.obj));
    */
  }

  install () {
    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    this.props.providers.forEach(provider => {
      const type = provider === 'rest' ? 'express' : provider;

      this.dependencies.push(`@feathersjs/${type}`);
    });

    this._packagerInstall(this.dependencies, {
      save: true
    });

    this._packagerInstall(this.devDependencies, {
      saveDev: true
    });

    this.logSteps && console.log('>>>>> app generator finished install()');
  }

  end () {
    this.logSteps && console.log('>>>>> app generator finished end()');
  }
};
