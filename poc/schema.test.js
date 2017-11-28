
const { join } = require('path');
const feathersDeclarationsToGraphql = require('./feathers-declartions-to-graphql');

const specs = {
  app: {
    src: 'src',
    packager: 'yarn@>= 0.18.0',
    providers: [
      'primus'
    ]
  },
  services: {
    user: {
      name: 'user',
      adapter: 'memory',
      path: '/users',
      requiresAuth: false,
      graphql: true,
    }
  },
  graphql: {
    path: 'mygraphql',
    resolvers: [
      'resolvers'
    ]
  }
};

// Construct declarations combining all Feathers services
const schemas = {};
const extensions = {};

Object.keys(specs.services || {}).forEach(serviceName => {
  const path = join(process.cwd(), specs.app.src, 'services', serviceName, `${serviceName}.schema`);
  const { schema, extension } = require(path);

  if (schema && typeof schema === 'object' && schema !== null && schema.properties
    && specs.services[serviceName].graphql
  ) {
    schemas[serviceName] = schema;
    if (extension) extensions[serviceName] = extension || {};
  }
});

// Create GraphQL definitions
const results = feathersDeclarationsToGraphql(schemas, extensions, specs.services || {});

console.log(`...schemas:\n${results.schemas}`);
console.log(`...resolvers:\n${results.resolvers}`);
console.log('...mapping:\n', results.mapping);
console.log('...addResolvers:\n', results.addResolvers);
