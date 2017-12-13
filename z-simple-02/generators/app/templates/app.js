const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('winston');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
<% if (hasProvider('socketio')) { %>const socketio = require('@feathersjs/socketio');<% } %>
<% if (hasProvider('primus')) { %>const primus = require('@feathersjs/primus');<% } %>

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

<%- insertFragment('imports') %>
<%- insertFragment('init') %>

const app = express(feathers());
<%- insertFragment('use_start') %>

// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));
<%- insertFragment('use_end') %>

// Set up Plugins and providers
<%- insertFragment('config_start') %>
<% if (hasProvider('rest')) { %>app.configure(express.rest());<% } %>
<% if (hasProvider('socketio')) { %>app.configure(socketio());<% } %>
<% if(hasProvider('primus')) { %>app.configure(primus({ transformer: 'websockets' }));<% } %>
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);
<%- insertFragment('config_middle') %>

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));
<%- insertFragment('config_end') %>

app.hooks(appHooks);

<%- insertFragment('exports') %>
module.exports = app;

<%- insertFragment('end') %>
