const nedb1 = require('./nedb-1/nedb-1.service.js');
const nameSpaceNedb2 = require('./name/space/nedb-2/nedb-2.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(nedb1);
  app.configure(nameSpaceNedb2);
};
