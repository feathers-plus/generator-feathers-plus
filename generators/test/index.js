
const chalk = require('chalk');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    const generator = this;
    const js = specs.app.ts ? 'ts' : 'js';

    const hookChoices = Object.keys(specs.hooks || {}).map(name => {
      const hookSpec = specs.hooks[name];
      const hookFileName = hookSpec.fileName;

      if (hookSpec.ifMulti !== 'y') {
        const specsService = specs.services[hookSpec.singleService];
        const sn = specsService.fileName;
        const sfa = generator.getNameSpace(specsService.subFolder)[1];

        return {
          name: `${sn}/hooks/${hookFileName}.${js}`,
          value: {
            hookName: name,
            appLevelHook: false,
            serviceName: specsService.name,
            hookFileName,
            pathToHook: `services/${sfa.length ? `${sfa.join('/')}/` : ''}${sn}/hooks/${hookFileName}.${js}`
          }
        };
      } else {
        return {
          name: `/hooks/${hookFileName}.${js}`,
          value: {
            hookName: name,
            appLevelHook: true,
            serviceName: '*none',
            hookFileName,
            pathToHook: `hooks/${hookFileName}.${js}`
          }
        };
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
        name: 'n/a service - unit (tested on the server',
        value: 'serviceUnit'
      }, {
        name: 'n/a service - integration (tested using client/server)',
        value: 'serviceInteg'
      }, {
        name: 'n/a authentication - base (client/server)',
        value: 'authBase'
      }, {
        name: 'n/a authentication - services (client/server)',
        value: 'authServices'
      }]
    }, {
      name: 'hookInfo',
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

      }

      Object.assign(this.props, answers);
    });
  }

  writing () {
    generatorWriting(this, 'test');
  }
};