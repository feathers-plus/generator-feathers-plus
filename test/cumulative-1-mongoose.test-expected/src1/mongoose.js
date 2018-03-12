
// mongoose.js - Mongoose adapter
const mongoose = require('mongoose');
// !code: imports // !end
// !code: init // !end

module.exports = function (app) {
  mongoose.connect(app.get('mongodb'), {});
  mongoose.Promise = global.Promise;
  // !code: func_init // !end

  app.set('mongooseClient', mongoose);
  // !code: more // !end
};

// !code: funcs // !end
// !code: end // !end
