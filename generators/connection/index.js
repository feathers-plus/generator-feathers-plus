
const chalk = require('chalk');
const { snakeCase } = require('lodash');
const { parse } = require('path');
const { cwd } = require('process');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class ConnectionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    this._initialGeneration = !this._specs.connections;
    initSpecs('connection');

    if (this._initialGeneration) {
      this.log(
        '\n\n'
        + chalk.green.bold('We are adding the first connection in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    } else {
      this.log(
        '\n\n'
        + chalk.green.bold('We are adding or changing connections in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    }

    this.dependencies = [];

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
          { name: 'Memory', value: 'memory' }, // no adapter to choose
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL (MariaDB)', value: 'mysql' },
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

          if (connection) {
            if (connection.connection){
              setProps({ connectionString: connection.connection });
            } else if (database === 'rethinkdb' && connection.db) {
              setProps({ connectionString: `rethinkdb://${connection.servers[0].host}:${connection.servers[0].port}/${connection.db}` });
            } else {
              setProps({ connectionString: connection });
            }
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

  writing () {
    generatorWriting(this, 'connection');
  }
};
