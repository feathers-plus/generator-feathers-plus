
// Expand app specs store with derived data which the templates will use.

const url = require('url');

module.exports = function specsExpand(specs) {

  // Expand connections
  const connections = specs.connections || {};
  const _databases = specs._databases = {};
  const _adapters = specs._adapters = {};
  const _dbConfigs = specs._dbConfigs = {};
  let _connectionDeps = [];

  console.log('0', specs);

  Object.keys(connections).forEach(databaseAdapter => {
    let { database, adapter, connectionString } = connections[databaseAdapter];

    _databases[database] = connectionString || null;
    const { dependencies, connection } = getConnectionInfo (connectionString, database, adapter);
    console.log('2', dependencies);
    console.log('3', connection);
    _dbConfigs[database] = connection;
    _connectionDeps = _connectionDeps.concat(dependencies);

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

  specs._connectionDeps = [...new Set(_connectionDeps)].sort(); // get unique elements
}

function getConnectionInfo (connectionString, database, adapter) {
  const sqlPackages = {
    mariadb: 'mysql',
    mysql: 'mysql2',
    mssql: 'mssql',
    postgres: 'pg',
    sqlite: 'sqlite3'
    // oracle: 'oracle'
  };

  switch (database) {
    case 'nedb':
      return {
        dependencies: 'nedb',
        connection: connectionString.substring(7, connectionString.length),
      };

    case 'rethinkdb':
      const parsed = url.parse(connectionString);

      return {
        dependencies: 'rethinkdbdash',
        connection: {
          db: parsed.path.substring(1, parsed.path.length),
          servers: [{
            host: parsed.hostname,
            port: parsed.port
          }]
        }
      };

    case 'memory':
      return {
        dependencies: [],
        connection: null,
      };

    case 'mongodb':
      return {
        dependencies: adapter,
        connection: connectionString,
      };

    case 'mariadb':
    case 'mysql':
    case 'mssql':
    // case oracle:
    case 'postgres': // eslint-disable-line no-fallthrough
    case 'sqlite':
      const dependencies = [adapter];

      if (sqlPackages[database]) {
        dependencies.push(sqlPackages[database]);
      }

      if (adapter === 'sequelize') {
        return {
          dependencies,
          connection: connectionString,
        };
      }

      return {
        dependencies,
        connection: {
          client: sqlPackages[database],
          connection: (database === 'sqlite' && typeof connectionString === 'string') ? {
            filename: connectionString.substring(9, connectionString.length)
          } : connectionString
        },
      };

    default:
      throw new Error(`Invalid database '${database}'. Cannot assemble configuration.`);
  }
}
