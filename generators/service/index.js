const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const deepMerge = require('deepmerge');
const Generator = require('../../lib/generator');
const chalk = require('chalk');
const mongoose = require('mongoose');
const { join } = require('path');

const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const doesFileExist = require('../../lib/does-file-exist');
const stringifyPlus = require('../../lib/stringify-plus');
const generatorFs = require('../../lib/generator-fs');
const { refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');

const generatorWriting = require('../writing');

const nativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.ObjectId]: 'mongoose.Schema.ObjectId',
};

const templatePath = path.join(__dirname, 'templates');
const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = class ServiceGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
  }

  prompting() {
    const generator = this;
    let serviceSpecs;
    this.checkPackage();

    const { props, _specs: specs } = generator;
    inspector('specs: service before', specs)
    const { mapping, feathersSpecs } = serviceSpecsExpand(specs);
    inspector('specs: service after', specs)

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

            const fileName = specs.services[input].fileName || input; // todo || input is temporary
            const path = join(process.cwd(), specs.app.src, 'services', fileName, `${fileName}.schema`);

            if (!doesFileExist(`${path}.js`)) {
              generator.log('\n\n' + chalk.green.bold('We are adding a new service.') + '\n');
              generator.log(chalk.green([
                'Once this generation is complete, define the JSON-schema for the data in module',
                `"services/${_.kebabCase(input)}/${input}.schema.js". Then (re)generate this service.`,
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
              generator.log('\n\n' + chalk.green.bold('We are regenerating an existing service.') + '\n');
              generator.log(chalk.green([
                'Run "feathers-plus generate graphql" afterwards if you want any',
                'schema changes to also be handled in GraphQL.',
                '',
              ].join('\n')));

              mongooseSchema = serviceSpecsToMongoose(props.feathersSpecs[input], props.feathersSpecs[input]._extensions);
            }

            handleName(input, mongooseSchema);
            /*
            props.serviceName = input;
            props.feathersSpec = props.feathersSpecs[input] || {};
            props.mongooseSchema = mongooseSchema;
            props.mongooseSchemaStr = stringifyPlus(mongooseSchema, { nativeFuncs });
            */
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
          return serviceSpecs.path || `/${_.kebabCase(answers.name || props.name)}`;
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
        when: !this.defaultConfig.authentication && !props.authentication
      }, {
        name: 'graphql',
        message: 'Should this be served by GraphQL?',
        type: 'confirm',
        default() {
          return !!serviceSpecs.graphql;
        },
        //when: !!(this.defaultConfig.graphql && !props.graphql)
      }
    ];

    return this.prompt(prompts).then(answers => {
      const name = answers.name || props.name;

      this.props = Object.assign({
        requiresAuth: false
      }, props, answers, {
        snakeName: _.snakeCase(name),
        kebabName: _.kebabCase(name),
        camelName: _.camelCase(name)
      });

      this.logSteps && console.log('>>>>> service generator finished prompting()');
    });
  }

  writing() {
    generatorWriting(this, 'service');
      /*
    const generator = this;
    generator.logSteps && console.log('>>>>> service generator started writing()');

    const { props, _specs: specs } = generator;

    const { adapter, kebabName } = props;
    const moduleMappings = {
      generic: `./${kebabName}.class.js`,
      memory: 'feathers-memory',
      nedb: 'feathers-nedb',
      mongodb: 'feathers-mongodb',
      mongoose: 'feathers-mongoose',
      sequelize: 'feathers-sequelize',
      knex: 'feathers-knex',
      rethinkdb: 'feathers-rethinkdb'
    };
    const serviceModule = moduleMappings[adapter];
    const modelTpl = `${adapter}${props.authentication ? '-user' : ''}.js`;
    const hasModel = fs.existsSync(path.join(templatePath, 'model', modelTpl));

    const context = Object.assign({},
      props,
      {
        specs,
        libDirectory: generator.libDirectory,
        modelName: hasModel ? `${kebabName}.model` : null,
        path: stripSlashes(props.path),
        serviceModule,
      }
    );

    updateSpecs('service', props, 'service generator');

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      generator.composeWith(require.resolve('../connection'), { props: {
        adapter,
        service: props.name
      } });
    }

    // Common abbreviations for building 'todos'.
    const src = specs.app.src;
    const libDir = generator.libDirectory;
    const testDir = generator.testDirectory;
    const shared = 'templates-shared';
    const js = specs.options.configJs;
    // Custom abbreviations.
    const mainFileTpl = fs.existsSync(path.join(templatePath, 'types', `${adapter}.js`)) ?
      ['types', `${adapter}.js`] : ['name.service.ejs'];
    const auth = props.authentication ? '-auth' : '';
    const asyn = generator.hasAsync ? 'class-async.js' : 'class.js';
    const kn = kebabName;

    const todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      { type: 'tpl',  src: ['test', 'name.test.ejs'], dest: [testDir, 'services', `${kn}.test.js`],        ifNew: true },
      { type: 'tpl',  src: mainFileTpl,               dest: [libDir, 'services', kn, `${kn}.service.js`],  ifNew: true },
      { type: 'tpl',  src: ['model', modelTpl],       dest: [libDir, 'models', `${context.modelName}.js`], ifNew: true, ifSkip: !context.modelName },
      { type: 'tpl',  src: asyn,                      dest: [libDir, 'services', kn, `${kn}.class.js`],    ifNew: true, ifSkip: adapter !== 'generic' },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: 'name.schema.ejs',         dest: [libDir, 'services', kn, `${kn}.schema.js`] },
      { type: 'tpl',  src: 'name.mongoose.ejs',       dest: [libDir, 'services', kn, `${kn}.mongoose.js`] },
      { type: 'tpl',  src: 'name.validate.ejs',       dest: [libDir, 'services', kn, `${kn}.validate.js`] },
      { type: 'tpl',  src: `name.hooks${auth}.ejs`,   dest: [libDir, 'services', kn, `${kn}.hooks.js`] },
      { type: 'tpl',  src: ['..', '..', shared, 'services.index.ejs'], dest: [libDir, 'services', 'index.js'] },
    ];

    generatorFs(generator, context, todos);

    if (serviceModule.charAt(0) !== '.') {
      generator._packagerInstall([ serviceModule ], { save: true });
    }

    generator.logSteps && console.log('>>>>> service generator finished writing', todos.map(todo => todo.src || todo.obj));
    */
  }

  install () {
    this.logSteps && console.log('>>>>> service generator finished install()');
  }

  end () {
    this.logSteps && console.log('>>>>> service generator finished end()');
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
