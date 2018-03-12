
// nedb2-model.js - A Mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// !<DEFAULT> code: schema
const mongooseSchema = require('../services/nedb-2/nedb-2.mongoose');
// !end
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) {
  let mongooseClient = app.get('mongooseClient');
  // !code: func_init // !end

  // !<DEFAULT> code: client
  const nedb2 = new mongooseClient.Schema(mongooseSchema, { timestamps: true });
  // !end

  let returns = mongooseClient.model('nedb2', nedb2);

  // !code: func_return // !end
  return returns;
};
// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
