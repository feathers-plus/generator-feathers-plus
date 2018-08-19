
/* eslint-disable no-console */
// Start the server. (Can be re-generated.)
const logger = require('./logger');
const app = require('./app');
// !code: imports // !end
// !code: init // !end

const port = app.get('port');
const server = app.listen(port);
// !code: init2 // !end

process.on('unhandledRejection', (reason, p) => {
  // !<DEFAULT> code: unhandled_rejection_log
  logger.error('Unhandled Rejection at: Promise ', p, reason);
  // !end
  // !code: unhandled_rejection // !end
});

server.on('listening', () => {
  // !<DEFAULT> code: listening_log
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
  // !end
  // !code: listening
  const users1 = app.service('users1');
  users1.remove(null)
    .then(() => {
      return users1.create({
        uuid: 0, firstName: 'John', lastName: 'Szwaronek', email: 'john@gmail.com', password: 'john'
      });
    })
    .then(user => console.log('added user` record:', user));
  // !end
});

// !code: funcs // !end
// !code: end // !end
