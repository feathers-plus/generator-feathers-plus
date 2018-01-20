
// Configure middleware. (Can be re-generated.)
const mw1 = require('./mw-1');
const mw2 = require('./mw-2');

module.exports = function (app) { // eslint-disable-line no-unused-vars
  // Your middleware should include:
  //   app.use(mw1());
  //   app.use('mw2', mw2());
  //!<DEFAULT> code: middleware
  app.use(mw1());
  app.use('mw2', mw2());
  //!end
};
