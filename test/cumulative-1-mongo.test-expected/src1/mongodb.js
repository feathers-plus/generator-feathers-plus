
// mongodb.js - MongoDB adapter
const url = require('url');
const { MongoClient } = require('mongodb');
// !code: imports // !end
// !code: init // !end

module.exports = function (app) {
  let config = app.get('mongodb');
  let dbName = url.parse(config).path.substring(1);
  // !code: func_init // !end

  const promise = MongoClient.connect(config).then(client => {
    // For mongodb <= 2.2
    if (client.collection) {
      return client;
    }

    return client.db(dbName);
  });

  app.set('mongoClient', promise);
  // !code: more // !end
};
// !code: funcs // !end
// !code: end // !end
