module.exports = function(generator) {
  const { _specs: specs } = generator;
  const config = {
    host: `${specs.app.name}-app.feathersjs.com`,
    port: 'PORT'
  };

  return config;
};
