
// users1-model.js - A Mongoose model for a user entity
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// !<DEFAULT> code: schema
const mongooseSchema = require('../services/users-1/users-1.mongoose');
// !end
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) {
  let mongooseClient = app.get('mongooseClient');
  // !code: func_init // !end

  // !<DEFAULT> code: client
  const users1 = new mongooseClient.Schema(mongooseSchema, { timestamps: true });
  // !end

  let returns = mongooseClient.model('users1', users1);

  // !code: func_return // !end
  return returns;
};
// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
