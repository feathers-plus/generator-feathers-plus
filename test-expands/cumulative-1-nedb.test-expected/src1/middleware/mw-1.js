// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return function mw1(req, res, next) {
    // eslint-disable-next-line no-console
    console.log('mw1 middleware is running');
    next();
  };
};
