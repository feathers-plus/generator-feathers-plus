
// mongoose.ts - Mongoose adapter
import { App } from './app.interface';
import mongoose from 'mongoose';
// !code: imports // !end
// !code: init // !end

export default function (app: App) {
  mongoose.connect(app.get('mongodb'), {});
  mongoose.Promise = global.Promise;
  // !code: func_init // !end

  app.set('mongooseClient', mongoose);
  // !code: more // !end
}

// !code: funcs // !end
// !code: end // !end
