
const { join } = require('path');
const { authenticationServices } = require('@feathers-plus/test-utils');
const config = require('../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
const dbChangesAllowed = env.indexOf(process.env.NODE_ENV) !== -1;
if (!dbChangesAllowed) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test authentication.services.js');

  return;
}

const appRoot = join(__dirname, '..');
authenticationServices(appRoot, {
  delayAfterServerOnce: 500,
  delayAfterServerClose: 500,
  timeoutForStartingServerAndClient: 30000,
  timeoutForClosingingServerAndClient: 30000
});
