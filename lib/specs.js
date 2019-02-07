
// Initialize & update app specs store

const _ = require('lodash');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const { join } = require('path');
const { camelCase } = require('lodash');
const { singular } = require('pluralize');
const { writeFileSync } = require('fs');
const { tmpdir } = require('os');

const pkg = require('../package.json');
const specsExpand = require('./specs-expand');
const { refreshCodeFragments, resetForTest: resetFragments } = require('./code-fragments');

let stashedSpecs = {};
let specsPath;
let generator;

const log = false;

module.exports = {
  setPath,
  initSpecs,
  updateSpecs,
  resetForTest
};

function resetForTest () {
  generator = undefined;
  resetFragments();
}

async function setPath (generator1) {
  if (!generator) { // single initialize in case of composeWith
    console.log(`Using generator version ${pkg.version}`);

    // You have to run this file two times the first time.
    // This is because it never reports updates on the first run.
    // We are forcing a check every usage during the late beta period.
    for (let i = 1; i <= 2; i++) {
      let notifier = updateNotifier({
        pkg,
        updateCheckInterval: 0
      });

      if (notifier && notifier.update && notifier.update.lastest) {
        console.log(`Updated generator version on npm is ${notifier.update.lastest}`);
      }

      notifier.notify({
        message: 'Updated generator available.  \nRun ' +
        chalk.cyan('npm i -g @feathers-plus/cli to update')
      });
    }

    generator = generator1;
    specsPath = generator.destinationPath('feathers-gen-specs.json');

    // Note that readJSON calls initSpecs regardless if file exists or not.
    stashedSpecs = generator.fs.readJSON(specsPath, initSpecs('app'));

    // The specs may have been last written by an older version of the generator.
    // Mutate it to bring it up to date with the latest version.
    if (stashedSpecs.app && stashedSpecs.app.name) {
      stashedSpecs.app.environmentsAllowingSeedData =
        stashedSpecs.app.environmentsAllowingSeedData || '';
    }

    if (stashedSpecs.graphql) {
      stashedSpecs.graphql.doNotConfigure = stashedSpecs.graphql.doNotConfigure || false;
    }

    log && inspector('setPath before', stashedSpecs);
    specsExpand(stashedSpecs);
    log && inspector('setPath after', stashedSpecs);

    // stashedSpecs contains 'current' config/default.json as multiple generators may change it
    // and we don't want to keep rereading it.
    const appConfigPath = (stashedSpecs.app || {}).config || 'config';
    stashedSpecs._defaultJson = generator.fs.readJSON(
      generator.destinationPath(join(appConfigPath, 'default.json')),
      {}
    );

    // Test if test suite is running.
    const root = generator.destinationRoot();
    stashedSpecs._isRunningTests = root.startsWith('/private/') || (root.indexOf(tmpdir()) !== -1);

    // Extract custom code
    await refreshCodeFragments(generator.destinationRoot());
  }

  /*
   'this._specs = setPath(...)' in generator.js returns setPath's 'stashedSpecs' object, which is static.
   Therefore setPath, the initial generator and any generators started by 'composeWith'
   share the same object. They all 'see' any mutations made by the others.
   */
  return stashedSpecs;
}

// Obtain default values to show on prompts. Prompts provide their own values for undefined values here.
function initSpecs (what, info) {
  // 'generate options' is optional. Set defaults in order expected by test-expands.
  const specsOptions = stashedSpecs.options = stashedSpecs.options || {};
  specsOptions.ver = specsOptions.ver || '1.0.0';
  if (specsOptions.inspectConflicts === undefined) specsOptions.inspectConflicts = false;
  if (specsOptions.semicolons === undefined) specsOptions.semicolons = true;
  specsOptions.freeze = specsOptions.freeze || [];
  if (specsOptions.ts === undefined) specsOptions.ts = false;

  // Default newer props which older generators did not create.
  const specsApp = stashedSpecs.app = stashedSpecs.app || {};
  specsApp.environmentsAllowingSeedData = specsApp.environmentsAllowingSeedData || '';
  specsApp.seedData = specsApp.seedData || false;

  let graphql;
  let fileName;

  switch (what) {
    case 'all': // fall through
    case 'options':
      break;
    case 'app':
      stashedSpecs.app = stashedSpecs.app || {};
      stashedSpecs.services = stashedSpecs.services || {};
      stashedSpecs.connections = stashedSpecs.connections || undefined; // default must be undefined
      stashedSpecs.authentication = stashedSpecs.authentication || undefined;
      stashedSpecs.middlewares = stashedSpecs.middlewares || undefined;
      stashedSpecs.hooks = stashedSpecs.hooks || {};
      break;
    case 'service':
      fileName = generator.makeFileName(info.name);

    stashedSpecs.services = stashedSpecs.services || {};
    stashedSpecs.services[info.name] = stashedSpecs.services[info.name] || {
      name: info.name,
      nameSingular: singular(info.name) || info.name,
      subFolder: info.subFolder || '',
      fileName: fileName,
      adapter: 'nedb',
      path: `/${fileName}`,
      isAuthEntity: false,
      requiresAuth: false,
      graphql: true
    };
    break;
    case 'hook':
      stashedSpecs.hooks = stashedSpecs.hooks || {};
      stashedSpecs.hooks[info.name] = stashedSpecs.hooks[info.name] || {
        fileName: generator.makeFileName(info.name),
        camelName: camelCase(info.name),
        ifMulti: 'n',
        multiServices: [],
        singleService: '',
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
      graphql = stashedSpecs.graphql = stashedSpecs.graphql || {};
      graphql.path = graphql.path || '/graphql';
      graphql.strategy = graphql.strategy || 'services';
      graphql.sqlInterface = graphql.sqlInterface || (graphql.strategy === 'sql' ? 'sequelize' : null);
      graphql.requiresAuth = graphql.requiresAuth || false;
      graphql.doNotConfigure = graphql.doNotConfigure || false;
      break;
    case 'middleware':
      stashedSpecs.middlewares = stashedSpecs.middlewares || {};
      break;
    case 'fakes':
      break;
    case 'test':
      break;
    default:
      throw new Error(`Unexpected what ${what} in initSpecs. (specs)`);
  }

  stashedSpecs._generators = stashedSpecs._generators || [];
  stashedSpecs._generators.push(what);
  log && inspector(`initSpecs ${what}`, stashedSpecs);
  return stashedSpecs;
}

// Store answers returned for prompts
function updateSpecs (what, props, whosCalling) {
  if (!generator) throw new Error('specs#setPath not called before other funcs. (specs)');
  let serviceSpecs, hookSpecs, connectionSpecs, graphqlSpecs, middlewaresSpecs, key2;

  let app;

  switch (what) {
    case 'all':
      break;
    case 'options':
      stashedSpecs.options.ts = props.ts;
      stashedSpecs.options.semicolons = props.semicolons;
      stashedSpecs.options.inspectConflicts = props.inspectConflicts;
      break;
    case 'app':
      app = stashedSpecs.app;
      app.name = props.name;
      app.description = props.description;
      app.src = props.src;
      app.packager = props.packager;
      app.providers = props.providers;
      app.environmentsAllowingSeedData = props.environmentsAllowingSeedData.split(',')
        .map(str => str.trim()).filter(str => !!str).join(',');
      app.seedData = props.seedData || false; // ?????????????????????????????????????????????????????????
      break;
    case 'service':
      // No other service can be the user-entity if this service is it.
      if (props.isAuthEntity) {
        Object.keys(stashedSpecs.services).forEach(name => {
          if (name !== props.name && stashedSpecs.services[name].isAuthEntity) {
            generator.log();
            generator.log('The user-entity has changed.');
            generator.log([
              'You must later run ',
              chalk.yellow.bold('feathers-plus generate service'),
              ' for service ',
              chalk.yellow.bold(name),
            ].join(''));
            generator.log();
          }

          stashedSpecs.services[name].isAuthEntity = name === props.name;
        });
      }

      serviceSpecs = stashedSpecs.services[props.name];
      serviceSpecs.name = props.name;
      serviceSpecs.nameSingular = props.nameSingular;
      serviceSpecs.subFolder = props.subFolder || ''; // in tests props.subFolder === undefined
      serviceSpecs.fileName = generator.makeFileName(props.name);
      serviceSpecs.adapter = props.adapter;
      serviceSpecs.path = props.path;
      //serviceSpecs.isAuthEntity = serviceSpecs.isAuthEntity || false;
      serviceSpecs.requiresAuth = props.isAuthEntity || props.requiresAuth;
      serviceSpecs.graphql = props.graphql;
      break;
    case 'hook':
      hookSpecs = stashedSpecs.hooks[props.name];
      hookSpecs.fileName = generator.makeFileName(props.name);
      hookSpecs.camelName = camelCase(props.name);
      hookSpecs.ifMulti = props.ifMulti;
      hookSpecs.multiServices = props.multiServices || [];
      hookSpecs.singleService = props.singleService || '';
      break;
    case 'connection':
      connectionSpecs = stashedSpecs.connections[props.adapter || props.database] = {};
      connectionSpecs.database = props.database;
      connectionSpecs.adapter = props.adapter || props.database;
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
      graphqlSpecs = stashedSpecs.graphql = stashedSpecs.graphql || {};
      graphqlSpecs.name = 'graphql';
      graphqlSpecs.path = props.path;
      graphqlSpecs.strategy = props.strategy;
      graphqlSpecs.sqlInterface = props.sqlInterface || null;
      graphqlSpecs.requiresAuth = props.requiresAuth;
      graphqlSpecs.doNotConfigure = props.doNotConfigure;
      break;
    case 'middleware':
      key2 = props.name;
      middlewaresSpecs = stashedSpecs.middlewares[key2] = {};
      middlewaresSpecs.path = props.path;
      middlewaresSpecs.camel = props.camelName;
      middlewaresSpecs.kebab = props.kebabName;
      break;
    case 'fakes':
      break;
    case 'test':
      break;
    default:
      throw new Error(`Unexpected what ${what} in updateSpecs. (specs)`);
  }

  log && inspector(`updateSpecs ${what} from ${whosCalling}`, stashedSpecs);

  // Persisted specs do not contain specs extensions recalculated every generation
  const persistedSpecs = Object.assign({}, stashedSpecs);
  delete persistedSpecs._databases;
  delete persistedSpecs._adapters;
  delete persistedSpecs._dbConfigs;
  delete persistedSpecs._connectionDeps;
  delete persistedSpecs._generators;
  delete persistedSpecs._isRunningTests;
  delete persistedSpecs._defaultJson;
  delete persistedSpecs._hooks;

  // Write file explicitly so the user cannot prevent its update using the overwrite message.
  writeFileSync(specsPath, JSON.stringify(persistedSpecs, null, 2) + '\n');
}

const { inspect } = require('util');
function inspector (desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
