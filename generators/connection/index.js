const { snakeCase } = require('lodash');
const url = require('url');
const Generator = require('../../lib/generator');

const generatorFs = require('../../lib/generator-fs');
const specsExpand = require('../../lib/specs-expand');
const { initSpecs, updateSpecs } = require('../../lib/specs');

module.exports = class ConnectionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    initSpecs(this.specs, 'connections');
    this.dependencies = [];
  }

  _getConfiguration (connectionString, database, adapter) {
    const sqlPackages = {
      mariadb: 'mysql',
      mysql: 'mysql2',
      mssql: 'mssql',
      postgres: 'pg',
      sqlite: 'sqlite3'
      // oracle: 'oracle'
    };

    let parsed = {};

    switch (database) {
      case 'nedb':
        this.dependencies.push('nedb');
        return connectionString.substring(7, connectionString.length);

      case 'rethinkdb':
        parsed = url.parse(connectionString);
        this.dependencies.push('rethinkdbdash');

        return {
          db: parsed.path.substring(1, parsed.path.length),
          servers: [
            {
              host: parsed.hostname,
              port: parsed.port
            }
          ]
        };

      case 'memory':
        return null;

      case 'mongodb':
        this.dependencies.push(adapter);
        return connectionString;

      case 'mariadb':
      case 'mysql':
      case 'mssql':
      // case oracle:
      case 'postgres': // eslint-disable-line no-fallthrough
      case 'sqlite':
        this.dependencies.push(adapter);

        if (sqlPackages[database]) {
          this.dependencies.push(sqlPackages[database]);
        }

        if (adapter === 'sequelize') {
          return connectionString;
        }

        return {
          client: sqlPackages[database],
          connection: (database === 'sqlite' && typeof connectionString === 'string') ? {
            filename: connectionString.substring(9, connectionString.length)
          } : connectionString
        };

      default:
        throw new Error(`Invalid database '${database}'. Cannot assemble configuration.`);
    }
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
          return true; // todo ******************** get default

          const answers = getProps(current);
          const { database } = answers;
          const connection = defaultConfig[database];

          if (connection) {
            if (connection.connection){
              setProps({ connectionString:connection.connection });
            } else if (database === 'rethinkdb' && connection.db) {
              setProps({ connectionString:`rethinkdb://${connection.servers[0].host}:${connection.servers[0].port}/${connection.db}` });
            } else {
              setProps({ connectionString:connection });
            }
            return false;
          }

          return database !== 'memory';
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  _specsExpand(specs) {

    // Expand connections
    const connections = specs.connections || {};
    const _databases = specs._databases = {};
    const _adapters = specs._adapters = {};
    const _dbConfigs = specs._dbConfigs = {};

    Object.keys(connections).forEach(databaseAdapter => {
      let { database, adapter, connectionString } = connections[databaseAdapter];

      _databases[database] = connectionString || null;
      _dbConfigs[database] = this._getConfiguration (connectionString, database, adapter);

      if (adapter) {
        let template;

        if (database === 'rethinkdb') {
          template = 'rethinkdb.js';
        } else if (database === 'mssql' && adapter === 'sequelize') {
          template = `${adapter}-mssql.js`;
          adapter = 'sequelizeMssql';
        } else if (database !== 'nedb' && database !== 'memory') {
          template = `${adapter}.js`;
        }

        if (template) {
          _adapters[adapter] = template;
        }
      }
    });
  }

  // We generate all the defined connections, not just the current one.
  writing () {
    this.props.specs = this.specs;
    const props = this.props;
    const context = Object.assign({}, props, {
      hasProvider (name) { return props.specs.app.providers.indexOf(name) !== -1; },
    });

    // Update specs
    const path = this.destinationPath('feathers-gen-specs.json');
    updateSpecs(path, this.specs, 'connections', props);

    // Expand specs
    /*
    this._specsExpand(props.specs);
    inspector('current expanded', props.specs);
    delete props.specs._databases;
    delete props.specs._adapters;
    delete props.specs._dbConfigs;
    delete props.specs._connectionDeps;
    */
    specsExpand(props.specs);
    inspector('new expanded', props.specs);

    // List what to generate
    const specs = props.specs;
    const connections = specs.connections;
    const _adapters = specs._adapters;

    const newConfig = Object.assign({}, this.defaultConfig, specs._dbConfigs);

    const todos = !Object.keys(connections).length ? [] : [
      { type: 'json', sourceObj: newConfig,                                           destination: ['config', 'default.json'] },
      { type: 'tpl',  source: ['..', '..', 'templates-shared', `config.default.ejs`], destination: ['config', 'default.js'] },
      { type: 'tpl',  source: ['..', '..', 'templates-shared', `src.app.ejs`],        destination: [this.libDirectory, 'app.js'] },
    ];

    Object.keys(_adapters).sort().forEach(adapter => {
      todos.push(
        { type: 'copy',  source: _adapters[adapter], destination: [this.libDirectory, `${adapter}.js`], ifNew: true }
      );
    });

    // Generate
    generatorFs(this, context, todos);

    // Write file explicitly so the user cannot prevent its update using the overwrite message.
    this._packagerInstall(this.dependencies, {
      save: true
    });
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
  }
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
