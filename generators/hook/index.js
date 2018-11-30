
const chalk = require('chalk');
const makeDebug = require('debug');
const { camelCase } = require('lodash');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

const debug = makeDebug('generator-feathers-plus:prompts:hook');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    const generator = this;
    const srcFolder = specs.app.src;

    let hookSpecs; // The specs.hooks[] for the hook

    const serviceChoices = Object.keys(specs.services).sort().map(name => {
      return { name: name, value: name };
    });

    const prompts = [{
      name: 'name',
      message: 'What is the name of the hook?',
      filter(input) {
        return generator.makeFileName(input);
      },
      validate (input) {
        const isOld = specs.hooks && specs.hooks[input];

        initSpecs('hook', { name: input });
        hookSpecs = specs.hooks[input];

        if (isOld) {
          generator.log('\n');
          generator.log([
            chalk.green.bold('We are'),
            chalk.yellow.bold(' updating '),
            chalk.green.bold('the hook '),
            chalk.yellow.bold(camelCase(input)),
            chalk.green.bold(' in file '),
            chalk.yellow.bold(input),
            '.\n'
          ].join(''));
        } else {
          generator.log('\n');
          generator.log([
            chalk.green.bold('We will be'),
            chalk.yellow.bold(' adding '),
            chalk.green.bold('the new hook '),
            chalk.yellow.bold(camelCase(input)),
            chalk.green.bold(' in file '),
            chalk.yellow.bold(input),
            '.\n'
          ].join(''));
        }


        return true;
      },
    }, {
      name: 'ifMulti',
      message: 'The hook will be used with',
      type: 'list',
      choices() {
        return [
          {
            name: ` Multiple services (${srcFolder}/hooks/)`,
            value: 'y'
          }, {
            name: ` One service (${srcFolder}/services/*/hooks/)`,
            value: 'n'
          }
        ];
      },
      default() {
        return hookSpecs.ifMulti || 'n';
      },
    }, {
      name: 'multiServices',
      message: 'Which services will this hook be used with?\n',
      type: 'checkbox',
      when: answers => answers.ifMulti === 'y',
      choices: [
        {
          name: ' I will add the hook where its needed',
          value: '*none'
        }, {
          name: ` Use with all services as an app hook (${srcFolder}/app.hooks)`,
          value: '*app'
        }
      ].concat(serviceChoices),
      default () {
        return hookSpecs.multiServices || ['*none'];
      },
      validate (input) {
        if (input.length === 0) {
          return 'You must pick at least one option.';
        }

        if (input.length > 1 && (input.indexOf('*none') !== -1 || input.indexOf('*all') !== -1)) {
          return 'You have picked too many options.';
        }

        return true;
      },
    }, {
      name: 'singleService',
      message: 'Which service will this hook be used with?',
      type: 'list',
      when: answers => answers.ifMulti !== 'y',
      choices: serviceChoices,
      default () {
        return hookSpecs.singleService || (serviceChoices[0] ? serviceChoices[0].value : '');
      },
    }];

    return this.prompt(prompts).then(answers => {
      Object.assign(this.props, answers);

      // Set missing defaults when call during test
      if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
        this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
      }

      debug('hook prompting() ends', this.props);

      if (!generator.callWritingFromPrompting()) return;

      debug('hook writing patch starts. call generatorWriting');
      generatorWriting(generator, 'hook');
      debug('hook writing patch ends');
    });
  }

  writing () {
    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'hook');
  }
};
