
const chalk = require('chalk');
const { parse, sep } = require('path');
const { cwd } = require('process');
const { kebabCase } = require('lodash');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class AppGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    const generator = this;
    this._initialGeneration = !specs.app || !specs.app.src;
    initSpecs('app');

    if (this._initialGeneration) {
      this.log();
      this.log();
      this.log([
        chalk.green.bold('We are creating a'),
        chalk.yellow.bold(' new '),
        chalk.green.bold('app in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
    } else {
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' updating '),
        chalk.green.bold('the app base in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
      this.log();
    }

    const dependencies = [
      '@feathersjs/feathers',
      '@feathersjs/errors',
      '@feathersjs/configuration',
      '@feathersjs/express',
      'feathers-hooks-common',
      'serve-favicon',
      'compression',
      'helmet',
      'winston',
      'cors',

      'eslint',
      'mocha',
      'request',
      'request-promise',

      '@feathersjs/express',
      '@feathersjs/socketio',
      '@feathersjs/primus'
    ];

    // Define defaults for prompts which may not be displayed
    props.name = specs.app.name || this.pkg.name || process.cwd().split(sep).pop();
    props.src = specs.app.src || (this.pkg.directories && this.pkg.directories.lib) || 'src';
    props.description = specs.app.description || this.pkg.description ||
      `Project ${kebabCase(this.props.name)}`;

    const prompts = [{
      name: 'name',
      message: 'Project name',
      when: this._initialGeneration,
      default: props.name,
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
      when: this._initialGeneration,
      default: answers => specs.app.description || this.pkg.description ||
        `Project ${kebabCase(answers.name)}`
    }, {
      name: 'src',
      message: 'What folder should the source files live in?',
      default: props.src,
      when: this._initialGeneration,
      filter: input => generator.makeFileName(input)
    }, {
      name: 'packager',
      type: 'list',
      message: 'Which package manager are you using\n  (has to be installed globally)?',
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
      message: 'What type of API are you making?\n',
      choices: [{
        name: 'REST',
        value: 'rest',
        checked: specs.app.providers ? specs.app.providers.indexOf('rest') !== -1 : true
      }, {
        name: 'Realtime via Socket.io',
        value: 'socketio',
        checked: specs.app.providers ? specs.app.providers.indexOf('socketio') !== -1 : true
      }, {
        name: 'Realtime via Primus',
        value: 'primus',
        checked: specs.app.providers ? specs.app.providers.indexOf('primus') !== -1 : false
      }],
      validate (input) {
        if (input.indexOf('primus') !== -1 && input.indexOf('socketio') !== -1) {
          return 'You can only pick SocketIO or Primus, not both.';
        }

        return true;
      }
    }];

    return this.prompt(prompts)
      .then(answers => {
        Object.assign(this.props, answers);
      });
  }

  writing () {
    generatorWriting(this, 'app');
  }
};
