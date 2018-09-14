// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return function mw2(req, res, next) {
    // eslint-disable-next-line no-console
    console.log('mw2 middleware is running');
    next();
  };
};
