
const { writeFileSync } = require('fs');

module.exports = {
  initSpecs,
  updateSpecs,
};

function initSpecs(specs = {}, what, info) {
  switch(what) {
    case 'app':
      specs.app = specs.app || {};
      break;
    case 'service':
      specs.services = specs.services || {};
      specs.services[info.name] = specs.services[info.name] || {
        name: info.name,
        adapter: 'nedb',
        path: `/${info.name}`,
        requiresAuth: false,
        graphql: true,
      };
      break;
    case 'graphql':
      specs.graphql = specs.graphql || {
        path: 'graphql',
        strategy: 'services',
      };
  }

  // todo inspector('...starting specs', specs);
}

function updateSpecs(path, specs, what, props) {
  switch(what) {
    case 'app':
      specs.app = specs.app || {};
      specs.app.src = props.src;
      specs.app.packager = props.packager;
      specs.app.providers = props.providers;

      break;
    case 'service':
      const serviceSpecs = specs.services[props.name];
      serviceSpecs.name = props.name;
      serviceSpecs.adapter = props.adapter;
      serviceSpecs.path = props.path;
      serviceSpecs.requiresAuth = props.requiresAuth;
      serviceSpecs.graphql = props.graphql;
      break;
    case 'graphql':
      specs.graphql.path = props.path;
      specs.graphql.strategy = props.strategy;
      break;
  }

  return writeFileSync(path, JSON.stringify(specs, null, 2));
}

// feathers-plus generator config
const genConfig = {
  backups: true,
  inserts: true,
};

// Sample application spec
const sampleSpec = {
  app: {
    //name: pkg.name,
    //desc: pkg.description,
    src: 'src',
    providers: ['rest', 'socketio'], // 'rest' 'socketio' 'primus'
    packager: 'npm@>= 3.0.0', // 'npm@>= 3.0.0' 'yarn@>= 0.18.0'
  },
  services: {
    "users": {
      name: 'users',
      adapter: 'nedb', // 'generic' 'memory' 'nedb' 'mongodn' 'mongoose' 'sequelize' 'knex' 'rethinkdb'
      path: '/users',
      requiresAuth: false,
    }
  },
  graphql: {
    path: 'graphql',
    strategies: 'services', // 'services', 'batchloaders', ' sql'
  },
};

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
