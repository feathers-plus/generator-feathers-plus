module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function mw1(req, res, next) {
    console.log('mw1 middleware is running'); // eslint-disable-line no-console
    next();
  };
};
