const Generator = require('../../lib/generator');
const path = require('path');
const makeConfig = require('./configs');
const { kebabCase } = require('lodash');

const generatorFs = require('../../lib/generator-fs');
const { refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');

module.exports = class AppGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.specs = initSpecs('app');
    this.fragments = refreshCodeFragments();

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      src: this.specs.app.src || (this.pkg.directories && this.pkg.directories.lib),
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
    const { props, specs } = this;
    props.specs = specs;

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
      default: this.specs.app.src || 'src',
      when: !this.specs.app.src && !(this.pkg.directories && this.pkg.directories.lib)
    }, {
      name: 'packager',
      type: 'list',
      message: 'Which package manager are you using (has to be installed globally)?',
      default: this.specs.app.packager || 'npm@>= 3.0.0',
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
        checked: this.specs.app.providers ? this.specs.app.providers.indexOf('rest') !== -1 : true,
      }, {
        name: 'Realtime via Socket.io',
        value: 'socketio',
        checked: this.specs.app.providers ? this.specs.app.providers.indexOf('socketio') !== -1 : true,
      }, {
        name: 'Realtime via Primus',
        value: 'primus',
        checked: this.specs.app.providers ? this.specs.app.providers.indexOf('primus') !== -1 : false,
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
    this.logSteps && console.log('>>>>> app generator started writing()');

    const props = this.props;
    const specs = props.specs;
    const pkg = this.pkg = makeConfig.package(this);

    const context = Object.assign({},
      props,
      {
        hasProvider (name) { return props.providers.indexOf(name) !== -1; },
        requiresAuth: false,
      },
    );

    const todos = [
      // Files which are written only if they don't exist. They are never rewritten (except for default.json)
      { type: 'copy', ifNew: true,  source: '.editorconfig',           destination: '.editorconfig' },
      { type: 'copy', ifNew: true,  source: '.eslintrc.json',          destination: '.eslintrc.json' },
      // This name hack is necessary because NPM does not publish `.gitignore` files
      { type: 'copy', ifNew: true,  source: '_gitignore',              destination: '.gitignore' },
      { type: 'copy', ifNew: true,  source: 'LICENSE',                 destination: 'LICENSE', },
      { type: 'tpl',  ifNew: true,  source: 'README.md.ejs',           destination: 'README.md' },

      { type: 'copy', ifNew: true,  source: ['public', 'favicon.ico'], destination: ['public', 'favicon.ico'] },
      { type: 'copy', ifNew: true,  source: ['public', 'index.html'],  destination: ['public', 'index.html'] },

      { type: 'json', ifNew: true,  ifSkip: specs.options.configJs,
                      sourceObj: makeConfig.configDefault(this),
                      destination: ['config', 'default.json'] },
      { type: 'json', ifNew: true,  ifSkip: specs.options.configJs,
                      sourceObj: makeConfig.configProduction(this),
                      destination: ['config', 'production.json'] },

      { type: 'copy', ifNew: true,
                      source: ['src', 'hooks', 'logger.js'],
                      destination: [props.src, 'hooks', 'logger.js'] },
      { type: 'copy', ifNew: true,
                      source: ['src', 'middleware', 'index.js'],
                      destination: [props.src, 'middleware', 'index.js'] },
      { type: 'copy', ifNew: true,
                      source: ['src', 'refs', 'common.json'],
                      destination: [props.src, 'refs', 'common.json'] },

      { type: 'tpl',  ifNew: true,
                      source: ['test', 'app.test.js'],
                      destination: [this.testDirectory, 'app.test.js']},

      // Files rewritten every (re)generation.
      { type: 'tpl',  ifSkip: !specs.options.configJs,
                      source: ['..', '..', 'templates-shared', 'config.default.ejs'],
                      destination: ['config', 'default.js'] },
      { type: 'tpl',  ifSkip: !specs.options.configJs,
                      source: ['config', 'production.ejs'],
                      destination: ['config', 'production.js'] },

      { type: 'tpl',  source: ['src', 'index.ejs'],     destination: [props.src, 'index.js'] },
      { type: 'tpl',  source: ['src', 'app.hooks.ejs'], destination: [props.src, 'app.hooks.js'] },
      { type: 'tpl',  source: ['src', 'channels.ejs'],  destination: [props.src, 'channels.js'] }, // work todo


      { type: 'tpl',  source: ['..', '..', 'templates-shared', 'src.app.ejs'],
                      destination: [props.src, 'app.js'] },
      { type: 'tpl',  source: ['..', '..', 'templates-shared', 'services.index.ejs'],
                      destination: [props.src, 'services', 'index.js'] },

      // Last files to write.
      { type: 'json', ifNew: true,
                      sourceObj: pkg,
                      destination: ['package.json'] },

    ];

    generatorFs(this, context, todos);

    this.logSteps && console.log('>>>>> app generator finished writing()', todos.map(todo => todo.source || todo.sourceObj));
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

    updateSpecs(this.specs, 'app', this.props, 'app generator');
    this.logSteps && console.log('>>>>> app generator finished install()');
  }

  end () {
    this.logSteps && console.log('>>>>> app generator finished end()');
  }
};
