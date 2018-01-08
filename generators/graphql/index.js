
const chalk = require('chalk');
const { camelCase, kebabCase, snakeCase } = require('lodash');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToGraphql = require('../../lib/service-specs-to-graphql');
const stringifyPlus = require('../../lib/stringify-plus');

const { initSpecs } = require('../../lib/specs');

module.exports = class ServiceGenerator extends Generator {
  prompting() {
    const { props, _specs: specs } = this;
    const graphqlSpecs = specs.graphql;
    this.checkPackage();

    const { mapping, feathersSpecs } = serviceSpecsExpand(specs);

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

    props.feathersSpecs = feathersSpecs;
    props.mapping= mapping;
    props.stringifyPlus = stringifyPlus;
    props.graphqlSchemas = serviceSpecsToGraphql(feathersSpecs);

    props.name = 'graphql';
    const prompts = [
      {
        type: 'list',
        name: 'strategy',
        message: 'How should Queries be completed?.',
        default() {
          return graphqlSpecs.strategy || 'services';
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
        when: !props.path,
        default(answers) {
          return graphqlSpecs.path || `/${kebabCase(answers.name || props.name)}`;
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
          return graphqlSpecs.requiresAuth || false;
        },
        when: !!(this.defaultConfig.authentication && !props.authentication)
      }
    ];

    return this.prompt(prompts).then(answers => {
      const name = props.name;

      this.props = Object.assign(
        { requiresAuth: false },
        props,
        answers,
        {
          snakeName: snakeCase(name),
          kebabName: kebabCase(name),
          camelName: camelCase(name)
        }
      );

      this.logSteps && console.log('>>>>> graphql generator finished prompting()');
    });
  }

  writing() {
    generatorWriting(this, 'graphql');
  }
};
