
// mongoose.ts - Mongoose adapter
import { App } from './app.interface';
import mongoose from 'mongoose';
// !code: imports // !end
// !code: init // !end

export default function (app: App) {
  mongoose.Promise = global.Promise;
  mongoose.connect(app.get('mongodb'), { useNewUrlParser: true })
    .then(({ connection }: any) => {
      console.log(`connected to "${connection.name}" database at ${connection.host}:${connection.port}`);
      return connection;
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
  // !code: func_init // !end

  app.set('mongooseClient', mongoose);
  // !code: more // !end
}

// !code: funcs // !end
// !code: end // !end
