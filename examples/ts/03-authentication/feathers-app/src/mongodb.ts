
// mongodb.ts - MongoDB adapter
import { App } from './app.interface';
import url from 'url';
import { MongoClient } from 'mongodb';
// !code: imports // !end
// !code: init // !end

export default function (app: App) {
  let config = app.get('mongodb');
  let dbName = url.parse(config).path!.substring(1);
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
}
// !code: funcs // !end
// !code: end // !end
