
// Expand app specs store with derived data which the templates will use.

const url = require('url');

module.exports = function specsExpand (specs) {
  // Expand connections
  const connections = specs.connections || {};
  const _databases = specs._databases = {};
  const _adapters = specs._adapters = {};
  const _dbConfigs = specs._dbConfigs = {};
  let _connectionDeps = [];

  // Find which adapters are currently being used. `connections` may contain ones no longer in use.
  const adaptersInUse = Object.keys(specs.services).map(name => specs.services[name].adapter);

  Object.keys(connections).forEach(adapter1 => {
    let { database, adapter, connectionString } = connections[adapter1];

    if (adaptersInUse.indexOf(adapter) === -1) return;
    _databases[database] = connectionString || null;
    const { dependencies, connection } = getConnectionInfo(connectionString, database, adapter);
    _dbConfigs[database] = connection;
    _connectionDeps = _connectionDeps.concat(dependencies);

    if (adapter) {
      let template;

      if (database === 'rethinkdb') {
        template = 'rethinkdb.ejs';
      } else if (database === 'mssql' && adapter === 'sequelize') {
        template = `${adapter}-mssql.ejs`;
        adapter = 'sequelizeMssql';
      } else if (database !== 'nedb' && database !== 'memory') {
        template = `${adapter}.ejs`;
      }

      if (template) {
        _adapters[adapter] = template;
      }
    }
  });

  specs._connectionDeps = [...new Set(_connectionDeps)].sort(); // get unique elements
  specs._generators = specs._generators || [];
};

function getConnectionInfo (connectionString, database, adapter) {
  const sqlPackages = {
    mysql: 'mysql2',
    mssql: 'mssql',
    postgres: 'pg',
    sqlite: 'sqlite3'
    // oracle: 'oracle'
  };

  let parsed;
  let dependencies;

  switch (database) {
    case 'nedb':
      return {
        dependencies: 'nedb',
        // Hack: Have to distinguish between newly added connection and an already configured one.
        connection: connectionString.indexOf('://') === -1
          ? connectionString : connectionString.substring(7, connectionString.length)
      };

    case 'rethinkdb':
      parsed = url.parse(connectionString);

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
        connection: null
      };

    case 'mongodb':
      return {
        dependencies: adapter,
        connection: connectionString
      };

    case 'mysql':
    case 'mssql':
    // case oracle:
    case 'postgres': // eslint-disable-line no-fallthrough
    case 'sqlite':
      dependencies = [adapter];

      if (sqlPackages[database]) {
        dependencies.push(sqlPackages[database]);
      }

      if (adapter === 'sequelize') {
        return {
          dependencies,
          connection: connectionString
        };
      }

      return {
        dependencies,
        connection: {
          client: sqlPackages[database],
          connection: (database === 'sqlite' && typeof connectionString === 'string')
            ? {
              // Hack: Have to distinguish between newly added connection and an already configured one.
              filename: connectionString.indexOf('://') === -1
                ? connectionString : connectionString.substring(9, connectionString.length)
            }
            : connectionString
        }
      };

    default:
      throw new Error(`Invalid database '${database}'. Cannot assemble configuration.`);
  }
}
