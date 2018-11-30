
const chalk = require('chalk');
const makeDebug = require('debug');
const { parse } = require('path');
const { cwd } = require('process');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const { initSpecs } = require('../../lib/specs');

const debug = makeDebug('generator-feathers-plus:prompts:graphql');

module.exports = class GraphqlGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    const generator = this;
    this._initialGeneration = !specs.graphql;
    initSpecs('graphql');

    this.log('\n\n');
    if (this._initialGeneration) {
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' creating '),
        chalk.green.bold('the initial GraphQL endpoint in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
    } else {
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' updating '),
        chalk.green.bold('the GraphQL endpoint in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
    }
    this.log();

    const graphqlSpecs = specs.graphql;
    const { mapping } = serviceSpecsExpand(specs, this);

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
      ''
    ].join('\n')));

    const prompts = [{
      type: 'list',
      name: 'strategy',
      message: 'How should Queries be completed?',
      default: graphqlSpecs.strategy,
      choices: [{
        name: 'Using standalone Feathers service calls.',
        value: 'services'
      }, {
        name: 'Using BatchLoaders.',
        value: 'batchloaders'
      }, {
        name: 'Using dynamic SQL statements.',
        value: 'sql'
      }]
    }, {
      type: 'list',
      name: 'sqlInterface',
      message: 'What SQL interface do you want to use?',
      default: 'sequelize', //graphqlSpecs.sqlInterface,
      when(answers) {
        return answers.strategy === 'sql';
      },
      choices: [{
        name: 'Sequelize.',
        value: 'sequelize'
      }, {
        name: 'Knex.',
        value: 'knex'
      }, {
        name: 'A custom interface.',
        value: 'custom'
      }]
    }, {
      name: 'path',
      message: 'Which path should the service be registered on?',
      default: graphqlSpecs.path,
      validate (input) {
        return input.trim() === '' ? 'Service path can not be empty' : true;
      }
    }, {
      name: 'requiresAuth',
      message: 'Does the service require authentication?',
      type: 'confirm',
      default: graphqlSpecs.requiresAuth,
      when: !!specs.authentication
    }, {
      name: 'doNotConfigure',
      message: 'Will you be using only the fgraphql hook, not the service?',
      type: 'confirm',
      default: graphqlSpecs.doNotConfigure,
    }];

    return this.prompt(prompts)
      .then(answers => {
        Object.assign(this.props, answers, {
          requiresAuth: answers.requiresAuth || false,
          snakeName: 'graphql',
          kebabName: 'graphql',
          camelName: 'graphql'
        });

        // Set missing defaults when call during test
        if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
          this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
        }

        debug('graphql prompting() ends', this.props);

        if (!generator.callWritingFromPrompting()) return;

        debug('graphql writing patch starts. call generatorWriting');
        generatorWriting(generator, 'graphql');
        debug('graphql writing patch ends');
      });
  }

  writing () {
    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'graphql');
  }
};
