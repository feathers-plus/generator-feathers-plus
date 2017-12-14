const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const j = require('@feathersjs/tools').transform;
const Generator = require('../../lib/generator');

const combineFeathersDeclarations = require('../../lib/combine-feathers-declarations');
const { insertFragment, refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');
const stringifyPlus = require('../../lib/stringify-plus');

const templatePath = path.join(__dirname, 'templates');
const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = class ServiceGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
    initSpecs(this.specs, 'graphql');

    const { schemas, mapping, fieldInfo, queryInfo } = combineFeathersDeclarations(this.specs);

    this.graphqlSchemas = schemas;
    this.mapping = mapping;
    this.fieldInfo = fieldInfo;
    this.queryInfo = queryInfo;

    /*
    console.log(`...schemas:\n${this.graphqlSchemas}`);
    console.log('...mapping:\n', this.mapping);
    console.log('...fieldInfo:\n', this.fieldInfo);
    console.log(`...queryInfo:\n${this.queryInfo}`);
    */

    /*
    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      src: this.specs.app.src || (this.pkg.directories && this.pkg.directories.lib),
    };
*/
  }

  prompting() {
    const graphqlSpecs = this.specs.graphql;
    this.checkPackage();

    const { props, specs } = this;
    props.name = 'graphql';
    const prompts = [
      {
        type: 'checkbox',
        name: 'resolvers',
        message: 'How should Queries be performed?.',
        choices: [{
          name: 'Using Feathers calls.',
          value: 'resolvers',
          checked: this.specs.graphql.resolvers ? this.specs.graphql.resolvers.indexOf('resolvers') !== -1 : true,
        }, {
          name: 'Using SQL statements. (More complex.)',
          value: 'sql',
          checked: this.specs.graphql.resolvers ? this.specs.graphql.resolvers.indexOf('sql') !== -1 : true,
        }]
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        when: !props.path,
        default(answers) {
          return graphqlSpecs.path || `/${_.kebabCase(answers.name || props.name)}`;
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
      stringifyPlus,
      graphqlSchemas: this.graphqlSchemas,
      mapping: this.mapping,
      fieldInfo: this.fieldInfo,
      queryInfo: this.queryInfo,
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

    destinationPath = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.hooks.js`);
    this.fs.copyTpl(
      this.templatePath(`graphql.hooks${this.props.authentication ? '.user' : ''}.js`),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath)})
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', 'graphql', 'graphql.schemas.js');
    this.fs.copyTpl(
      this.templatePath('graphql.schemas.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', 'graphql', 'service.resolvers.js');
    this.fs.copyTpl(
      this.templatePath('service.resolvers.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', 'graphql', 'sql.resolvers.js');
    this.fs.copyTpl(
      this.templatePath('sql.resolvers.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', 'graphql', 'sql.metadata.js');
    this.fs.copyTpl(
      this.templatePath('sql.metadata.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    destinationPath = this.destinationPath(this.libDirectory, 'services', 'graphql', 'sql.execute.js');
    this.fs.copyTpl(
      this.templatePath('sql.execute.ejs'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
    );

    this.fs.copyTpl(
      this.templatePath('graphql.service.ejs'),
      mainFile,
      Object.assign({}, context, { insertFragment: insertFragment(mainFile)})
    );

    destinationPath = this.destinationPath(this.testDirectory, 'services', `${kebabName}.test.js`);
    this.fs.copyTpl(
      this.templatePath('test.js'),
      destinationPath,
      Object.assign({}, context, { insertFragment: insertFragment(destinationPath)})
    );

    this._packagerInstall([
      'graphql',
      '@feathers-x/graphql',
      'merge-graphql-schemas',
    ], { save: true });
  }

  install () {
    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    const path = this.destinationPath('feathers-gen-specs.json');
    updateSpecs(path, this.specs, 'graphql', this.props);
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(desc);
  console.log(inspect(obj, { depth, colors: true }));
}
