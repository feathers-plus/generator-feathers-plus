
/* eslint-disable no-console */
// Start the server. (Can be re-generated.)
const logger = require('winston');
const app = require('./app');
// !code: imports
const { inspect } = require('util');
// !end
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
  // !code: listening // !end
});

// !code: funcs
async function init() {
  const roles = app.service('roles');
  const users = app.service('users');
  const teams = app.service('teams');

  await roles.remove(null);
  await users.remove(null);
  await teams.remove(null);

  const rolesData = await roles.create([
    { name: 'admin' },
    { name: 'normal' }
  ]);

  const usersData = await users.create([
    { firstName: 'John', lastName: 'Doe', email: 'john-doe@gmail.com', roleId: rolesData[0]._id },
    { firstName: 'Jane', lastName: 'Doe', email: 'jane-doe@gmail.com', roleId: rolesData[1]._id },
    { firstName: 'Jack', lastName: 'Doe', email: 'jack-doe@gmail.com', roleId: rolesData[1]._id },
  ]);

  const teamsData = await teams.create([
    { name: 'alpha', memberIds: [usersData[0]._id, usersData[1]._id] },
    { name: 'beta', memberIds: [usersData[2]._id, usersData[1]._id] },
  ]);

  console.log('\nroles table:\n', inspect(rolesData, { colors: true, depth: 3 }));
  console.log('\nusers table:\n', inspect(usersData, { colors: true, depth: 3 }));
  console.log('\nteams table:\n', inspect(teamsData, { colors: true, depth: 3 }));

  return Promise.resolve(null);
}

async function queries() {
  const graphql = app.service('graphql');

  const findUsersOnly = `{
    findUser(query: {}) {
      firstName
      lastName
      fullName
      email
      role {
        name
      }
      teams {
        name
      }
    }
  }`;

  const findTeamsOnly = `{
    findTeam(query: {}) {
      name
      memberIds
      members {
        fullName
        role {
          name
        }
      }
    }
  }`;

  const usersResult = await graphql.find({ query: { query: findUsersOnly } })
    .catch(graphqlError);
  console.log('\nfindUsersOnly Query:\n', findUsersOnly);
  console.log('\nfindUsersOnly Result:\n', inspect(usersResult, { colors: true, depth: 6 }));

  const teamsResult = await graphql.find({ query: { query: findTeamsOnly } })
    .catch(graphqlError);
  console.log('\nfindTeamsOnly Query:\n', findTeamsOnly);
  console.log('\nfindTeamsOnly Result:\n', inspect(teamsResult, { colors: true, depth: 6 }));
}

function graphqlError(err) {
  console.log('errors\n', err.errors);
  console.log('data\n', err.data);

  throw err;
}

function qlParams (obj) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Expected object. (qlParams)');
  }

  return stringify(obj, undefined, undefined, '', '');
}

function stringify (obj, spacer = ' ', separator = ', ', leader = '{', trailer = '}') {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }

  const str = Object
    .keys(obj)
    .map(key => `${key}:${spacer}${stringify(obj[key], spacer, separator)}`)
    .join(', ');

  return `${leader}${str}${trailer}`;
}
// !end
// !code: end
init()
  .then(() => queries());
// !end
