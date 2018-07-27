
// Configure Feathers app. (Can be re-generated.)
import * as path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import logger from './logger';

import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
// tslint:disable-next-line
const generatorSpecs = require('../feathers-gen-specs.json');
import authentication from './authentication';

import sequelize from './sequelize';
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
// Host the public folder
app.use('/', express.static(app.get('public')));
// !code: use_end // !end

// Set up Plugins and providers
// !code: config_start // !end
app.configure(express.rest());
app.configure(socketio());

// Configure database adapters
app.configure(sequelize);

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);
// Configure authentication (see `authentication.ts`)
app.configure(authentication);
// Set up our services (see `services/index.ts`)
app.configure(services);
// Set up event channels (see channels.ts)
app.configure(channels);
// !code: config_middle // !end

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));
// !code: config_end // !end

app.hooks(appHooks);

const moduleExports = app;
// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
