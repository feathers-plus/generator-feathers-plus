
// mongodb.ts - MongoDB adapter
import { App } from './app.interface';
import { parseConnectionString } from 'mongodb-core';
import { MongoClient } from 'mongodb';
import logger from './logger';
// !code: imports // !end
// !code: init // !end

export default function (app: App) {
  let config = app.get('mongodb');
  // !code: func_init // !end

  const promise = MongoClient.connect(config, { useNewUrlParser: true }).then(client => {
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
}
// !code: funcs // !end
// !code: end // !end
