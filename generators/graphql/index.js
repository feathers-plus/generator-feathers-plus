
const chalk = require('chalk');
const { parse } = require('path');
const { cwd } = require('process');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const { initSpecs } = require('../../lib/specs');

module.exports = class ServiceGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    this._initialGeneration = !specs.graphql;
    initSpecs('graphql');

    if (this._initialGeneration) {
      this.log(
        '\n\n'
        + chalk.green.bold('We are creating the initial GraphQL endpoint in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    } else {
      this.log(
        '\n\n'
        + chalk.green.bold('We are changing the GraphQL endpoint in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    }

    const graphqlSpecs = specs.graphql;
    const { mapping } = serviceSpecsExpand(specs);

    if (!Object.keys(mapping.feathers).length) {
      this.log('No services are configured as being served by GraphQL. ');
      process.exit(0);
    }

    this.log(chalk.green([
      'Modules tailored to your schemas will be generated to run GraphQL Queries using',
      '- Feathers service calls, and',
      '- BatchLoaders which cache and batch Feathers service calls, and',
      '- Dynamically generated SQL statements.',
      'You may modify one or more of these modules according to your needs.',
      '',
      'If you want to use several of these modules, you can switch between them',
      'by rerunning "feathers-plus generate graphql" and switching options.',
      '',
    ].join('\n')));

    const prompts = [
      {
        type: 'list',
        name: 'strategy',
        message: 'How should Queries be completed?.',
        default() {
          return graphqlSpecs.strategy ;
        },
        choices: [
          {
            name: 'Using standalone Feathers service calls.',
            value: 'services',
          }, {
            name: 'Using BatchLoaders.',
            value: 'batchloaders',
          }, {
            name: 'Using dynamic SQL statements.',
            value: 'sql',
          }
        ]
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        default(answers) {
          return graphqlSpecs.path;
        },
        validate(input) {
          if(input.trim() === '') {
            return 'Service path can not be empty';
          }

          return true;
        }
      }, {
        name: 'requiresAuth',
        message: 'Does the service require authentication?',
        type: 'confirm',
        default() {
          return graphqlSpecs.requiresAuth;
        },
        when: !!this.defaultConfig.authentication
      }
    ];

    return this.prompt(prompts).then(answers => {
      this.props = Object.assign(
        props,
        answers,
        { requiresAuth: answers.requiresAuth || false },
        { snakeName: 'graphql', kebabName: 'graphql', camelName: 'graphql' },
      );

      this.logSteps && console.log('>>>>> graphql generator finished prompting()');
    });
  }

  writing() {
    generatorWriting(this, 'graphql');
  }
};
