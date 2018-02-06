
const chalk = require('chalk');
const { snakeCase } = require('lodash');
const { parse } = require('path');
const { cwd } = require('process');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class ConnectionGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    this._initialGeneration = !this._specs.connections;
    initSpecs('connection');

    if (this._initialGeneration) {
      this.log('\n\n');
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' adding '),
        chalk.green.bold('the first connection in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
      this.log();
    }

    const generator = this;
    this.dependencies = [];

    const databaseName = snakeCase(this.pkg.name);
    const defaultJson = specs._defaultJson;

    const combineProps = answers => Object.assign({}, this.props, answers);

    const prompts = [{
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
        // when started directly, database & adapter = undefined
        // when called by service generator, database = undefined, adapter = kind of service e.g. nedb
        const { database, adapter } = combineProps(current);

        if (database) {
          return false;
        }

        switch (adapter) {
          case 'nedb':
          case 'rethinkdb':
          case 'memory':
          case 'mongodb':
            generator.props.database = adapter;
            return false;
          case 'mongoose':
            generator.props.database = 'mongodb';
            return false;
        }

        return true;
      }
    }, {
      type: 'list',
      name: 'adapter',
      message: 'Which database adapter would you like to use?',
      default (current) {
        const { database } = combineProps(current);

        if (database === 'mongodb') {
          return 'mongoose';
        }

        return 'sequelize';
      },
      choices (current) {
        const { database } = combineProps(current);
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
        const { database, adapter } = combineProps(current);
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
    }, {
      name: 'connectionString',
      message: 'What is the database connection string?',
      default (current) {
        const { database } = combineProps(current);
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
        const { database } = combineProps(current);
        const connection = defaultJson[database];

        if (connection) {
          if (connection.connection) {
            generator.props.connectionString = connection.connection;
          } else if (database === 'rethinkdb' && connection.db) {
            const server = connection.servers[0];
            generator.props.connectionString = `rethinkdb://${server.host}:${server.port}/${connection.db}`;
          } else {
            generator.props.connectionString = connection;
          }
          return false;
        }

        return database !== 'memory';
      }
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing () {
    generatorWriting(this, 'connection');
  }
};
