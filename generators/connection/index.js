const { snakeCase } = require('lodash');
const url = require('url');
const Generator = require('../../lib/generator');

const generatorFs = require('../../lib/generator-fs');
const specsExpand = require('../../lib/specs-expand');
const { initSpecs, updateSpecs } = require('../../lib/specs');

module.exports = class ConnectionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.specs = initSpecs('connections');
    this.dependencies = [];
  }

  prompting () {
    this.checkPackage();

    const databaseName = snakeCase(this.pkg.name);
    const { defaultConfig } = this;

    const getProps = answers => Object.assign({}, this.props, answers);
    const setProps = props => Object.assign(this.props, props);

    const prompts = [
      {
        type: 'list',
        name: 'database',
        message: 'Which database are you connecting to?',
        default: 'nedb',
        choices: [
          { name: 'MariaDB', value: 'mariadb' },
          { name: 'Memory', value: 'memory' }, // no adapter to choose
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'NeDB', value: 'nedb' }, // no adapter to choose
          // { name: 'Oracle', value: 'oracle' },
          { name: 'PostgreSQL', value: 'postgres' },
          { name: 'RethinkDB', value: 'rethinkdb' }, // no adapter to choose
          { name: 'SQLite', value: 'sqlite' },
          { name: 'SQL Server', value: 'mssql' }
        ],
        when (current) {
          const answers = getProps(current);
          // when called by connection generator, database & adapter = undefined
          // when called by service generator, database = undefined, adapter = kind of service e.g. nedb
          const { database, adapter } = answers;

          if (database) {
            return false;
          }

          switch (adapter) {
            case 'nedb':
            case 'rethinkdb':
            case 'memory':
            case 'mongodb':
              setProps({ database: adapter });
              return false;
            case 'mongoose':
              setProps({ database: 'mongodb' });
              return false;
          }

          return true;
        }
      },
      {
        type: 'list',
        name: 'adapter',
        message: 'Which database adapter would you like to use?',
        default (current) {
          const answers = getProps(current);
          const { database } = answers;

          if (database === 'mongodb') {
            return 'mongoose';
          }

          return 'sequelize';
        },
        choices (current) {
          const answers = getProps(current);
          const { database } = answers;
          const mongoOptions = [
            { name: 'MongoDB Native', value: 'mongodb' },
            { name: 'Mongoose', value: 'mongoose' }
          ];
          const sqlOptions = [
            { name: 'Sequelize', value: 'sequelize' },
            { name: 'KnexJS', value: 'knex' }
          ];

          if (database === 'mongodb') {
            return mongoOptions;
          }

          // It's an SQL DB
          return sqlOptions;
        },
        when (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;
          if (adapter) {
            return false;
          }

          switch (database) {
            case 'nedb':
            case 'rethinkdb':
            case 'memory':
              return false;
          }

          return true;
        }
      },
      {
        name: 'connectionString',
        message: 'What is the database connection string?',
        default (current) {
          const answers = getProps(current);
          const { database } = answers;
          const defaultConnectionStrings = {
            mariadb: `mariadb://root:@localhost:3306/${databaseName}`,
            mongodb: `mongodb://localhost:27017/${databaseName}`,
            mysql: `mysql://root:@localhost:3306/${databaseName}`,
            nedb: 'nedb://../data',
            // oracle: `oracle://root:password@localhost:1521/${databaseName}`,
            postgres: `postgres://postgres:@localhost:5432/${databaseName}`,
            rethinkdb: `rethinkdb://localhost:28015/${databaseName}`,
            sqlite: `sqlite://${databaseName}.sqlite`,
            mssql: `mssql://root:password@localhost:1433/${databaseName}`
          };

          return defaultConnectionStrings[database];
        },
        when (current) {
          const answers = getProps(current);
          const { database } = answers;
          const connection = defaultConfig[database];
          console.log('1', database, connection, typeof connection, !!connection);

          if (connection) {
            if (connection.connection){
              setProps({ connectionString: connection.connection });
            } else if (database === 'rethinkdb' && connection.db) {
              setProps({ connectionString: `rethinkdb://${connection.servers[0].host}:${connection.servers[0].port}/${connection.db}` });
            } else {
              setProps({ connectionString: connection });
            }
            console.log('2 return false');
            return false;
          }

          return database !== 'memory';
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
      this.logSteps && console.log('>>>>> connection generator finished prompting()');
    });
  }

  // We generate all the defined connections, not just the current one.
  writing () {
    this.logSteps && console.log('>>>>> connection generator started writing()');
    this.props.specs = this.specs;
    const props = this.props;
    const context = Object.assign({}, props, {
      hasProvider (name) { return props.specs.app.providers.indexOf(name) !== -1; },
    });

    // Update specs with prompts and then expand the specs, as we use the result below.
    // Also, the specs have to be updated before the end of writing() because of the comment
    // in generators/service/index.js#writing.
    updateSpecs(props.specs, 'connections', this.props, 'connection generator');
    specsExpand(props.specs);

    // Update dependencies
    console.log('1', props.specs._connectionDeps);
    this.dependencies = this.dependencies.concat(props.specs._connectionDeps);

    // List what to generate
    const specs = props.specs;
    const connections = specs.connections;
    const _adapters = specs._adapters;

    // Common abbreviations for building 'todos'.
    const src = props.src;
    const libDir = this.libDirectory;
    const testDir = this.testDirectory;
    const shared = 'templates-shared';
    const js = specs.options.configJs;
    // Custom abbreviations.
    const newConfig = Object.assign({}, this.defaultConfig, specs._dbConfigs);

    const todos = !Object.keys(connections).length ? [] : [
      { type: 'json', obj: newConfig,                                  dest: ['config', 'default.json'], ifSkip: js },
      { type: 'tpl',  src: ['..', '..', shared, `config.default.ejs`], dest: ['config', 'default.js'],   ifSkip: !js },
      { type: 'tpl',  src: ['..', '..', shared, `src.app.ejs`],        dest: [libDir, 'app.js'] },
    ];

    Object.keys(_adapters).sort().forEach(adapter => { todos.push(
      { type: 'copy', src: _adapters[adapter],                         dest: [libDir, `${adapter}.js`],  ifNew: true }
    ); });

    // Generate
    generatorFs(this, context, todos);

    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    this._packagerInstall(this.dependencies, {
      save: true
    });

    this.logSteps && console.log('>>>>> connection generator finished writing()', todos.map(todo => todo.src || todo.obj));
  }

  install () {
    this.logSteps && console.log('>>>>> connection generator finished install()');
  }

  end () {
    const { database, connectionString } = this.props;

    // NOTE (EK): If this is the first time we set this up
    // show this nice message.
    if (connectionString && !this.defaultConfig[database]) {
      const databaseName = snakeCase(this.pkg.name);
      this.log();
      this.log(`Woot! We've set up your ${database} database connection!`);

      switch (database) {
        case 'mariadb':
        case 'mongodb':
        case 'mssql':
        case 'mysql':
        // case 'oracle':
        case 'postgres': // eslint-disable-line no-fallthrough
        case 'rethinkdb':
          this.log(`Make sure that your ${database} database is running, the username/role is correct, and the database "${databaseName}" has been created.`);
          this.log('Your configuration can be found in the projects config/ folder.');
          break;
      }
    }

    console.log('>>>>> connection generator finished end()');
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
