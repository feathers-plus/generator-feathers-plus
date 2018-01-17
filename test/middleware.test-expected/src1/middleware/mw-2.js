module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function mw2(req, res, next) {
    console.log('mw2 middleware is running'); // eslint-disable-line no-console
    next();
  };
};
