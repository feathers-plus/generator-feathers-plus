
const chalk = require('chalk');
const deepMerge = require('deepmerge');
const mongoose = require('mongoose');
const { camelCase, kebabCase, snakeCase } = require('lodash');
const { cwd } = require('process');
const { join, parse } = require('path');

const doesFileExist = require('../../lib/does-file-exist');
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const stringifyPlus = require('../../lib/stringify-plus');

const { initSpecs } = require('../../lib/specs');

const nativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId',
};

module.exports = class ServiceGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    const generator = this;
    let serviceSpecs;

    const { mapping, feathersSpecs } = serviceSpecsExpand(specs);

    props.feathersSpecs = feathersSpecs;
    props.mapping= mapping;
    props.deepMerge = deepMerge;
    props.stringifyPlus = stringifyPlus;

    function handleName(name, mongooseSchema) {
      initSpecs('service', { name });
      serviceSpecs = specs.services[name];

      props.serviceName = name;
      props.feathersSpec = props.feathersSpecs[name] || {};
      props.mongooseSchema = mongooseSchema;
      props.mongooseSchemaStr = stringifyPlus(mongooseSchema, { nativeFuncs });
    }

    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the service?',
        validate(input) {
          if(input.trim() === '') {
            return 'Service name can not be empty';
          }

          if(input.trim() === 'authentication') {
            return '`authentication` is a reserved service name.';
          }

          let mongooseSchema;

          try {
            initSpecs('service', { name: input });
            serviceSpecs = specs.services[input];

            const fileName = specs.services[input].fileName;
            const path = join(process.cwd(), specs.app.src, 'services', fileName, `${fileName}.schema`);

            if (!doesFileExist(`${path}.js`)) {
              generator.log(
                '\n\n'
                + chalk.green.bold('We are adding a new service in dir ')
                + chalk.yellow.bold(parse(cwd()).base)
                + '\n'
              );
              generator.log(chalk.green([
                'Once this generation is complete, define the JSON-schema for the data in module',
                `"services/${kebabCase(input)}/${input}.schema.js". Then (re)generate this service.`,
                '',
                'This second generation will take the schema you added and generate',
                '- A Mongoose model, and',
                '- A Sequelize model, and',
                '- Create, update and patch validation hooks.',
                '',
                'Run "feathers-plus generate graphql" if you want any changes reflected in GraphQL.',
                '',
              ].join('\n')));

              mongooseSchema = {};
            } else {
              generator.log(
                '\n\n'
                + chalk.green.bold('We are changing an existing service in dir ')
                + chalk.yellow.bold(parse(cwd()).base)
                + '\n'
              );
              generator.log(chalk.green([
                'Run "feathers-plus generate graphql" afterwards if you want any',
                'schema changes to also be handled in GraphQL.',
                '',
              ].join('\n')));

              mongooseSchema = serviceSpecsToMongoose(props.feathersSpecs[input], props.feathersSpecs[input]._extensions);
            }

            handleName(input, mongooseSchema);
          } catch (err) {
            generator.log(err);
          }

          return true;
        },
        when: () => {
          if (!props.name) return true;

          // Generator called by 'generate authentication'
          handleName(props.name, {});
          return false;
        }
      }, {
        type: 'list',
        name: 'adapter',
        message: 'What kind of service is it?',
        default() {
          return serviceSpecs.adapter || 'nedb';
        },
        choices: [
          {
            name: 'A custom service',
            value: 'generic'
          }, {
            name: 'In Memory',
            value: 'memory'
          }, {
            name: 'NeDB',
            value: 'nedb'
          }, {
            name: 'MongoDB',
            value: 'mongodb'
          }, {
            name: 'Mongoose',
            value: 'mongoose'
          }, {
            name: 'Sequelize',
            value: 'sequelize'
          }, {
            name: 'KnexJS',
            value: 'knex'
          }, {
            name: 'RethinkDB',
            value: 'rethinkdb'
          }
        ]
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        when: !props.path,
        default(answers) {
          return serviceSpecs.path || `/${kebabCase(answers.name || props.name)}`;
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
          return !!serviceSpecs.requiresAuth;
        },
        when: !!(specs.authentication && specs._generators.indexOf('authentication') === -1)
      }, {
        name: 'graphql',
        message: 'Should this be served by GraphQL?',
        type: 'confirm',
        default() {
          return !!serviceSpecs.graphql;
        },
      }
    ];

    return this.prompt(prompts).then(answers => {
      const name = answers.name || props.name;

      this.props = Object.assign({
        requiresAuth: false
      }, props, answers, {
        snakeName: snakeCase(name),
        kebabName: kebabCase(name),
        camelName: camelCase(name)
      });

      this.logSteps && console.log('>>>>> service generator finished prompting()');
    });
  }

  writing() {
    generatorWriting(this, 'service');
  }
};
