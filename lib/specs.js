
// Initialize & update app specs store

const _ = require('lodash');
const { writeFileSync } = require('fs');

let stashedSpecs = {};
let specsPath;
let generator;

const log = false;

module.exports = {
  setPath,
  initSpecs,
  updateSpecs,
};

function setPath(generator1, path) {
  if (!generator) { // single initialize in case of composeWith
    generator = generator1;
    specsPath = path;

    stashedSpecs = generator.fs.readJSON(specsPath, initSpecs('app'));
  }

  /*
   'this._specs = setPath(...)' in gnerator.js returns setPath's 'stashedSpecs' object, which is static.
   Therefore setPath, the initial generator and any generators started by 'composeWith'
   share the same object. They all 'see' any mutations made by the others.
   */
  return stashedSpecs;
}

function initSpecs(what, info) {
  switch(what) {
    case 'all':
      break;
    case 'app':
      stashedSpecs.options = stashedSpecs.options || { configJs: false };
      stashedSpecs.app = stashedSpecs.app || {};
      stashedSpecs.services = stashedSpecs.services || {};
      stashedSpecs.connections = stashedSpecs.connections || {};
      stashedSpecs.authentication = stashedSpecs.authentication || {};
      break;
    case 'service':
      stashedSpecs.services = stashedSpecs.services || {};
      stashedSpecs.services[info.name] = stashedSpecs.services[info.name] || {
        name: info.name,
        fileName: `${_.kebabCase(info.name)}`,
        adapter: 'nedb',
        path: `/${_.kebabCase(info.name)}`,
        requiresAuth: false,
        graphql: true,
      };
      break;
    case 'authentication':
      stashedSpecs.authentication = stashedSpecs.authentication || {};
      stashedSpecs.authentication.strategies = stashedSpecs.authentication.strategies || [];
      break;
    case 'graphql':
      stashedSpecs.graphql = stashedSpecs.graphql || {
        path: 'graphql',
        strategy: 'services',
      };
      break;
    case 'connections':
      stashedSpecs.connections = stashedSpecs.connections || {};
      break;
    default:
      throw new Error(`Unexpected what ${what}. (specs)`);
  }

  return stashedSpecs;
}

function updateSpecs(specs, what, props, whosCalling) {
  if (!generator) throw new Error('specs#setPath not called before other funcs. (specs)');

  switch(what) {
    case 'app':
      // specs.options = specs.options;
      specs.app = specs.app || {};
      specs.app.src = props.src;
      specs.app.packager = props.packager;
      specs.app.providers = props.providers;

      log && inspector(`updateSpecs app from ${whosCalling}`, specs);
      stashedSpecs.app = specs.app;
      break;
    case 'service':
      const serviceSpecs = specs.services[props.name];
      serviceSpecs.name = props.name;
      serviceSpecs.fileName = `${_.kebabCase(props.name)}`;
      serviceSpecs.adapter = props.adapter;
      serviceSpecs.path = props.path;
      serviceSpecs.requiresAuth = props.requiresAuth;
      serviceSpecs.graphql = props.graphql;

      log && inspector(`updateSpecs service from ${whosCalling}`, specs);
      stashedSpecs.services[props.name] = serviceSpecs;
      break;
    case 'authentication':
      stashedSpecs.authentication.strategies = props.strategies;
      break;
    case 'connections':
      const key = `${props.database}+${props.adapter}`;
      const connectionSpecs = specs.connections[key] = {};
      connectionSpecs.database = props.database;
      connectionSpecs.adapter = props.adapter;
      connectionSpecs.connectionString = props.connectionString;

      log && inspector(`updateSpecs connections from ${whosCalling}`, specs);
      stashedSpecs.connections[key] = connectionSpecs;
      break;
    case 'graphql':
      specs.graphql.name = 'graphql';
      specs.graphql.path = props.path;
      specs.graphql.strategy = props.strategy;

      log && inspector(`updateSpecs graphql from ${whosCalling}`, specs);
      stashedSpecs.graphql = specs.graphql;
      break;
  }

  // Persisted specs do not contain specs extensions recalculated every generation
  const persistedSpecs = Object.assign({}, stashedSpecs);
  delete persistedSpecs._databases;
  delete persistedSpecs._adapters;
  delete persistedSpecs._dbConfigs;
  delete persistedSpecs._connectionDeps;

  // Write file explicitly so the user cannot prevent its update using the overwrite message.
  return writeFileSync(specsPath, JSON.stringify(persistedSpecs, null, 2));
}

const { inspect } = require('util');
function inspector(desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
