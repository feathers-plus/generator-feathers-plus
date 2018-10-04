
const { join } = require('path');
const { authenticationBase } = require('@feathers-plus/test-utils');
const config = require('../config/default.json');

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || [];
if (!env.includes(process.env.NODE_ENV) || process.argv.includes('--noclient')) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test authentication.base.js');

  return;
}

const appRoot = join(__dirname, '..');
authenticationBase(appRoot, {
  delayAfterServerOnce: 500,
  delayAfterServerClose: 500,
  timeoutForStartingServerAndClient: 30000,
  timeoutForClosingingServerAndClient: 30000
});
