
// mongodb.js - MongoDB adapter
const { parseConnectionString } = require('mongodb-core');
const { MongoClient } = require('mongodb');
const logger = require('./logger');
// !code: imports // !end
// !code: init // !end

module.exports = function (app) {
  let config = app.get('mongodb');
  // !code: func_init // !end

  const promise = MongoClient.connect(config, { useNewUrlParser: true, useCreateIndex: true }).then(client => {
    // For mongodb <= 2.2
    if (client.collection) {
      return client;
    }

    const dbName = parseConnectionString(config, () => {});
    return client.db(dbName);
  })
    .catch(error => {
      console.log(error);
      logger.error(error);
    });

  app.set('mongoClient', promise);
  // !code: more // !end
};
// !code: funcs // !end
// !code: end // !end
