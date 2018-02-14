
// Configure middleware. (Can be re-generated.)
const mw1 = require('./mw-1')
const mw2 = require('./mw-2')

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  // Add your custom middleware here. Remember that
  // in Express, the order matters.
  // Your middleware should include:
  //   app.use(mw1())
  //   app.use('mw2', mw2())
  //!<DEFAULT> code: middleware
  app.use(mw1())
  app.use('mw2', mw2())
  //!end
}
