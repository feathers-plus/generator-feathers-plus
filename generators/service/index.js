const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const j = require('@feathersjs/tools').transform;
const Generator = require('../../lib/generator');

const feathersDeclarationToService = require('../../lib/feathers-declaration-to-service');
const stringifyPlus = require('../../lib/stringify-plus');
const { insertFragment, refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');


const templatePath = path.join(__dirname, 'templates');
const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = class ServiceGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();

    /*
    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      src: this.specs.app.src || (this.pkg.directories && this.pkg.directories.lib),
    };
*/
  }

  prompting() {
    let serviceSpecs;
    this.checkPackage();

    const { props, specs } = this;
    props.stringifyPlus = stringifyPlus;

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

          try {
            initSpecs(specs, 'service', { name: input });
            serviceSpecs = specs.services[input];

            const { schema, extension, mongooseSchema, mongooseSchemaStr } =
              feathersDeclarationToService(input, specs);

            props.schema = schema;
            props.extension = extension;
            props.mongooseSchema = mongooseSchema;
            props.mongooseSchemaStr = mongooseSchemaStr;
          } catch (err) {
            console.log(err);
          }

          return true;
        },
        when: !props.name
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
    });
  }

  _transformCode(code) {
    const { camelName, kebabName } = this.props;
    const ast = j(code);
    const mainExpression = ast.find(j.FunctionExpression)
      .closest(j.ExpressionStatement);

    if(mainExpression.length !== 1) {
      throw new Error(`${this.libDirectory}/services/index.js seems to have more than one function declaration and we can not register the new service. Did you modify it?`);
    }

    const serviceRequire = `const ${camelName} = require('./${kebabName}/${kebabName}.service.js');`;
    const serviceCode = `app.configure(${camelName});`;

    // Add require('./service')
    mainExpression.insertBefore(serviceRequire);
    // Add app.configure(service) to service/index.js
    mainExpression.insertLastInFunction(serviceCode);

    return ast.toSource();
  }

  writing() {
    let destinationPath;
    const { adapter, kebabName } = this.props;
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
    const mainFile = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.service.js`);
    const modelTpl = `${adapter}${this.props.authentication ? '-user' : ''}.js`;
    const hasModel = fs.existsSync(path.join(templatePath, 'model', modelTpl));
    const context = Object.assign({}, this.props, {
      libDirectory: this.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(this.props.path),
      serviceModule,
    });

    // Do not run code transformations if the service file already exists
    if (!this.fs.exists(mainFile)) {
      const servicejs = this.destinationPath(this.libDirectory, 'services', 'index.js');
      const transformed = this._transformCode(
        this.fs.read(servicejs).toString()
      );

      this.conflicter.force = true;
      this.fs.write(servicejs, transformed);
    }

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      this.composeWith(require.resolve('../connection'), {
        props: {
          adapter,
          service: this.props.name
        }
      });
    } else if(adapter === 'generic') {
      // Copy the generic service class
      destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.class.js`);
      this.fs.copyTpl(
        this.templatePath(this.hasAsync ? 'class-async.js' : 'class.js'),
        destinationPath,
        Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
      );
    }

    if (context.modelName) {
      // Copy the model
      destinationPath = this.destinationPath(this.libDirectory, 'models', `${context.modelName}.js`);
      this.fs.copyTpl(
        this.templatePath('model', modelTpl),
        destinationPath,
        Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
      );
    }

    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.hooks.js`);
    this.fs.copyTpl(
      this.templatePath(`hooks${this.props.authentication ? '-user' : ''}.js`),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.schema.js`);
    this.fs.copyTpl(
      this.templatePath('name.schema.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    if (fs.existsSync(path.join(templatePath, 'types', `${adapter}.js`))) {
      this.fs.copyTpl(
        this.templatePath('types', `${adapter}.js`),
        mainFile,
        Object.assign({}, context, { insertFragment: insertFragment(mainFile)})
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('service.js'),
        mainFile,
        Object.assign({}, context, { insertFragment: insertFragment(mainFile)})
      );
    }

    destinationPath = this.destinationPath(this.testDirectory, 'services', `${kebabName}.test.js`);
    this.fs.copyTpl(
      this.templatePath('test.js'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.mongoose.js`);
    this.fs.copyTpl(
      this.templatePath('name.mongoose.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    /* NeDB does not use a model
    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.nedb.js`);
    this.fs.copyTpl(
      this.templatePath('name.nedb.js'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );
    */

    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.validate.js`);
    this.fs.copyTpl(
      this.templatePath('name.validate.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    if (serviceModule.charAt(0) !== '.') {
      this._packagerInstall([ serviceModule ], { save: true });
    }
  }

  install () {
    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    const path = this.destinationPath('feathers-gen-specs.json');
    updateSpecs(path, this.specs, 'service', this.props);
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
