
// Configure Feathers app. (Can be re-generated.)
// !code: preface // !end
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const generatorSpecs = require('../feathers-gen-specs.json');
const authentication = require('./authentication');

// !code: imports // !end
// !code: init // !end

const app = express(feathers());
// !code: use_start // !end

// Load app configuration
app.configure(configuration());
// !<DEFAULT> code: init_config
app.set('generatorSpecs', generatorSpecs);
// !end

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// !<DEFAULT> code: use_static
// Host the public folder
app.use('/', express.static(app.get('public')));
// !end
// !code: use_end // !end

// Set up Plugins and providers
// !code: config_start // !end
app.configure(express.rest(
  // !code: express_rest // !end
));
app.configure(socketio(
  // !code: express_socketio // !end
));

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Configure authentication (see `authentication.js`)
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);
// !code: config_middle // !end

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));
// !code: config_end // !end

app.hooks(appHooks);

const moduleExports = app;
// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
