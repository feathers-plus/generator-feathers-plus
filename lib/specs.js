
// Initialize & update app specs store

const _ = require('lodash');
const { writeFileSync } = require('fs');
const specsExpand = require('./specs-expand');
const { refreshCodeFragments } = require('./code-fragments');

let stashedSpecs = {};
let specsPath;
let generator;

const log = false;

module.exports = {
  setPath,
  initSpecs,
  updateSpecs
};

function setPath (generator1, path) {
  if (!generator) { // single initialize in case of composeWith
    generator = generator1;
    specsPath = path;

    // Extract custom code
    refreshCodeFragments();

    // Note that readJSON calls initSpecs regardless if file exists or not.
    stashedSpecs = generator.fs.readJSON(specsPath, initSpecs('app'));
    log && inspector('setPath before', stashedSpecs);
    specsExpand(stashedSpecs);
    log && inspector('setPath after', stashedSpecs);
  }

  /*
   'this._specs = setPath(...)' in gnerator.js returns setPath's 'stashedSpecs' object, which is static.
   Therefore setPath, the initial generator and any generators started by 'composeWith'
   share the same object. They all 'see' any mutations made by the others.
   */
  return stashedSpecs;
}

function initSpecs (what, info) {
  switch (what) {
    case 'all':
      break;
    case 'app':
      stashedSpecs.options = stashedSpecs.options || { ver: '1.0.0' };
      stashedSpecs.app = stashedSpecs.app || {};
      stashedSpecs.services = stashedSpecs.services || {};
      stashedSpecs.connections = stashedSpecs.connections || undefined; // default must be undefined
      stashedSpecs.authentication = stashedSpecs.authentication || undefined;
      stashedSpecs.middlewares = stashedSpecs.middlewares || undefined;
      break;
    case 'service':
      stashedSpecs.services = stashedSpecs.services || {};
      stashedSpecs.services[info.name] = stashedSpecs.services[info.name] || {
        name: info.name,
        fileName: `${_.kebabCase(info.name)}`,
        adapter: 'nedb',
        path: `/${_.kebabCase(info.name)}`,
        isAuthEntity: false,
        requiresAuth: false,
        graphql: true
      };
      break;
    case 'connection':
      stashedSpecs.connections = stashedSpecs.connections || {};
      break;
    case 'authentication':
      stashedSpecs.authentication = stashedSpecs.authentication || {};
      stashedSpecs.authentication.strategies = stashedSpecs.authentication.strategies || [];
      stashedSpecs.authentication.entity = stashedSpecs.authentication.entity || undefined;
      break;
    case 'graphql':
      stashedSpecs.graphql = stashedSpecs.graphql || {
        path: '/graphql',
        strategy: 'services',
        requiresAuth: false
      };
      break;
    case 'middleware':
      stashedSpecs.middlewares = stashedSpecs.middlewares || {};
      break;
    default:
      throw new Error(`Unexpected what ${what}. (specs)`);
  }

  stashedSpecs._generators = stashedSpecs._generators || [];
  stashedSpecs._generators.push(what);
  log && inspector(`initSpecs ${what}`, stashedSpecs);
  return stashedSpecs;
}

function updateSpecs (what, props, whosCalling) {
  if (!generator) throw new Error('specs#setPath not called before other funcs. (specs)');
  let serviceSpecs, connectionSpecs, graphqlSpecs, middlewaresSpecs, key1, key2; // for no-case-declarations

  switch (what) {
    case 'app':
      stashedSpecs.app.src = props.src;
      stashedSpecs.app.packager = props.packager;
      stashedSpecs.app.providers = props.providers;
      break;
    case 'service':
      serviceSpecs = stashedSpecs.services[props.name];
      serviceSpecs.name = props.name;
      serviceSpecs.fileName = `${_.kebabCase(props.name)}`;
      serviceSpecs.adapter = props.adapter;
      serviceSpecs.path = props.path;
      serviceSpecs.isAuthEntity = props.isAuthEntity || false;
      serviceSpecs.requiresAuth = props.requiresAuth;
      serviceSpecs.graphql = props.graphql;
      break;
    case 'connection':
      key1 = `${props.database}+${props.adapter}`;
      connectionSpecs = stashedSpecs.connections[key1] = {};
      connectionSpecs.database = props.database;
      connectionSpecs.adapter = props.adapter;
      connectionSpecs.connectionString = props.connectionString;

      log && inspector('updateSpecs connection before', stashedSpecs);
      specsExpand(stashedSpecs);
      log && inspector('updateSpecs connection after', stashedSpecs);
      break;
    case 'authentication':
      stashedSpecs.authentication = stashedSpecs.authentication || {};
      stashedSpecs.authentication.strategies = props.strategies;
      stashedSpecs.authentication.entity = props.entity;
      break;
    case 'graphql':
      graphqlSpecs = stashedSpecs.graphql = {};
      graphqlSpecs.name = 'graphql';
      graphqlSpecs.path = props.path;
      graphqlSpecs.strategy = props.strategy;
      graphqlSpecs.requiresAuth = props.requiresAuth;
      break;
    case 'middleware':
      key2 = props.name;
      middlewaresSpecs = stashedSpecs.middlewares[key2] = {};
      middlewaresSpecs.path = props.path;
      middlewaresSpecs.camel = props.camelName;
      middlewaresSpecs.kebab = props.kebabName;
      break;
  }

  log && inspector(`updateSpecs ${what} from ${whosCalling}`, stashedSpecs);

  // Persisted specs do not contain specs extensions recalculated every generation
  const persistedSpecs = Object.assign({}, stashedSpecs);
  delete persistedSpecs._databases;
  delete persistedSpecs._adapters;
  delete persistedSpecs._dbConfigs;
  delete persistedSpecs._connectionDeps;
  delete persistedSpecs._generators;

  // Write file explicitly so the user cannot prevent its update using the overwrite message.
  writeFileSync(specsPath, JSON.stringify(persistedSpecs, null, 2));
}

const { inspect } = require('util');
function inspector (desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
