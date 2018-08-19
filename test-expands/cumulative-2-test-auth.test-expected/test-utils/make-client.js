
const axios = require('axios');
const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');
const rest = require('@feathersjs/rest-client')
const localStorage = require('./local-storage');

const defaultIoOptions = {
  transports: ['websocket'],
  forceNew: true,
  reconnection: false,
  extraHeaders: {}
};

module.exports = function makeClient ({ transport, timeout, url, ioOptions, ifNoAuth }) {
  transport = transport || 'socketio';
  timeout = timeout || 60000;
  url = url || 'http://localhost:3030';
  ioOptions = ioOptions || defaultIoOptions;

  const appClient = feathersClient();

  switch (transport) {
    case 'socketio':
      const socket = io(url, ioOptions);
      appClient.configure(feathersClient.socketio(socket, { timeout }));
      break;
    case 'rest':
      appClient.configure(feathersClient.rest(url).axios(axios));
      break;
    default:
      throw new Error(`Invalid transport ${transport}. (makeClient`);
  }

  if (!ifNoAuth) {
    appClient.configure(feathersClient.authentication({
      storage: localStorage
    }));
  }

  return appClient;
};
