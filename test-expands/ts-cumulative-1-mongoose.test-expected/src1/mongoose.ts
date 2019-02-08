
// mongoose.ts - Mongoose adapter
import { App } from './app.interface';
import mongoose from 'mongoose';
import logger from './logger';
// !code: imports // !end
// !code: init // !end

export default function (app: App) {
  mongoose.Promise = global.Promise;
  mongoose.connect(app.get('mongodb'), { useNewUrlParser: true, useCreateIndex: true })
    .then(({ connection }: any) => {
      // tslint:disable-next-line:no-console
      console.log(`connected to "${connection.name}" database at ${connection.host}:${connection.port}`);
      return connection;
    })
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.log(error);
      logger.error(error);
      process.exit(1);
    });
  // !code: func_init // !end

  app.set('mongooseClient', mongoose);
  // !code: more // !end
}

// !code: funcs // !end
// !code: end // !end
