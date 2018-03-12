
// nedb1-model.js - A Mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// !<DEFAULT> code: schema
const mongooseSchema = require('../services/nedb-1/nedb-1.mongoose');
// !end
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) {
  let mongooseClient = app.get('mongooseClient');
  // !code: func_init // !end

  // !<DEFAULT> code: client
  const nedb1 = new mongooseClient.Schema(mongooseSchema, { timestamps: true });
  // !end

  let returns = mongooseClient.model('nedb1', nedb1);

  // !code: func_return // !end
  return returns;
};
// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
