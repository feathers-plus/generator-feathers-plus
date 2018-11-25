
const chalk = require('chalk');
const makeDebug = require('debug');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');

const debug = makeDebug('generator-feathers-plus:prompts:test');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    const generator = this;
    const js = specs.options.ts ? 'ts' : 'js';

    const hookChoices = Object.keys(specs.hooks || {}).map(name => {
      const hookSpec = specs.hooks[name];
      const hookFileName = hookSpec.fileName;

      if (hookSpec.ifMulti !== 'y') {
        const sn = specs.services[hookSpec.singleService].fileName;
        return { name: `${sn}/hooks/${hookFileName}.${js}`, value: name };
      } else {
        return { name: `/hooks/${hookFileName}.${js}`, value: name };
      }
    }).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    const serviceChoices = Object.keys(specs.services).sort().map(name => {
      return { name: name, value: name };
    });

    const prompts = [{
      name: 'testType',
      message: 'Which kind of test is required?',
      type: 'list',
      choices: [{
        name: 'hook - unit (tested as a function)',
        value: 'hookUnit'
      }, {
        name: 'hook - integration (tested using a fake service)',
        value: 'hookInteg'
      }, {
        name: 'service - server (tested on the server)',
        value: 'serviceUnit'
      }, {
        name: 'service - client (tested using client/server)',
        value: 'serviceInteg'
      }, {
        name: 'authentication - base (client/server)',
        value: 'authBase'
      }, {
        name: 'authentication - services (client/server)',
        value: 'authServices'
      }]
    }, {
      name: 'hookName',
      message: 'Which hook is being tested?',
      type: 'list',
      when: answers => answers.testType === 'hookUnit' || answers.testType === 'hookInteg',
      choices: hookChoices
    }, {
      name: 'serviceName',
      message: 'What is the name of the service being tested?',
      type: 'list',
      when: answers => answers.testType === 'serviceUnit' || answers.testType === 'serviceInteg',
      choices: serviceChoices
    }];

    return this.prompt(prompts).then(answers => {
      if (['serviceInteg', 'authBase', 'authServices'].indexOf(answers.testType) !== -1) {
        generator.log('\n');
        generator.log([
          chalk.green.bold('Configuration options will be added to '),
          chalk.yellow.bold('config/default.json'),
          chalk.green.bold(' as ')
        ].join(''));
        generator.log([
          chalk.yellow.bold('tests.client'),
          chalk.green.bold('. '),
          chalk.green.bold('The client/server tests use them, you may also.'),
        ].join(''));
        generator.log([
          chalk.green.bold('You may customize this config as necessary.'),
        ].join(''));
        generator.log('');
      }

      if (['authBase', 'authServices'].indexOf(answers.testType) !== -1) {
        const environmentsAllowingSeedData = specs.app.environmentsAllowingSeedData;

        if (environmentsAllowingSeedData.length) {
          generator.log([
            chalk.green.bold('This test will run only when '),
            chalk.yellow.bold('NODE_ENV'),
            chalk.green.bold(' is '),
            chalk.yellow.bold(environmentsAllowingSeedData),
            chalk.green.bold('.'),
          ].join(''));
        } else {
          generator.log([
            chalk.green.bold('This test will not run until a test environment is set using '),
          ].join(''));
          generator.log([
            chalk.yellow.bold('generate app'),
            chalk.green.bold('.'),
          ].join(''));
        }

        if (answers.testType === 'authServices') {
          generator.log([
            '',
            'Authentication is assumed active on each method for services generated',
            'with authentication. No authentication is assumed active on any method',
            'for services generated without authentication.',
            '',
            'Of course you could change this manually by removing or adding, say,',
            chalk.yellow.bold('authenticate(\'local\')') + ' hooks. You could even use the ' + chalk.yellow.bold('disallow'),
            'common hook to entirely disallow client access.',
            '',
            'Only such authentication or disallow changes need be specified in file ',
            chalk.yellow.bold('config/default.json') + ' as prop ' + chalk.yellow.bold('tests.client.overriddenAuth') + '.',
            '',
            'For example:',
            chalk.yellow('overriddenAuth: {'),
            chalk.yellow('  serviceNameWithAuth: {'),
            chalk.yellow('    update: \'noauth\',  // authentication has been removed'),
            chalk.yellow('    remove: \'disallow\' // client cannot call remove'),
            chalk.yellow('  },'),
            chalk.yellow('  serviceNameNoAuth: {'),
            chalk.yellow('    create: \'auth\'     // authentication has been added'),
            chalk.yellow('  }'),
            chalk.yellow('}'),
            '',
            '',
            ''
          ].join('\n'));
        }
      }

      Object.assign(this.props, answers);

      // Set missing defaults when call during test
      if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
        this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
      }

      debug('test prompting() ends', this.props);

      if (!generator.callWritingFromPrompting()) return;

      debug('test writing patch starts. call generatorWriting');
      generatorWriting(generator, 'test');
      debug('test writing patch ends');
    });
  }

  writing () {
    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'test');
  }
};
