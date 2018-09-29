module.exports = function(generator, envName) {
  return {
    mongodb: `mongodb://no-connection-string-config-${envName}`,
    mysql: `mysql://root:@no-connection-string-config-${envName}`,
    nedb: `nedb://no-connection-string-config-${envName}`,
    postgres: `postgres://postgres:@no-connection-string-config-${envName}`,
    rethinkdb: `rethinkdb://no-connection-string-config-${envName}`,
    sqlite: `sqlite://no-connection-string-config-${envName}`,
    mssql: `mssql://root:password@no-connection-string-config-${envName}`,
  };
};
