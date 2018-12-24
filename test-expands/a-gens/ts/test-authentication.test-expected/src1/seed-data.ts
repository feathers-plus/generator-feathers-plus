
/* tslint:disable:no-console */
import { join } from 'path';
import { readJsonFileSync } from '@feathers-plus/test-utils';
import { App } from './app.interface';
// !code: imports // !end

// Determine if command line argument exists for seeding data
let ifSeedServices = ['--seed', '-s'].some(str => process.argv.slice(2).includes(str));

// Determine if environment allows test to mutate existing DB data.
function areDbChangesAllowed(testConfig: { environmentsAllowingSeedData: string[] }) {
  let { environmentsAllowingSeedData = [] } = testConfig;
  if (process.env.NODE_ENV) {
    return environmentsAllowingSeedData.includes(process.env.NODE_ENV);
  }
  return false;
}

// Get generated fake data
let fakeData = readJsonFileSync(join(__dirname, '../seeds/fake-data.json')) || {};

// Get generated services
let services = (readJsonFileSync(join(__dirname, '../feathers-gen-specs.json')) || {}).services;
// !code: init // !end

export default async function (app: App) {
  const ifDbChangesAllowed = areDbChangesAllowed(app.get('tests'));
  // !code: func_init // !end
  if (!ifSeedServices) return;
  if (!ifDbChangesAllowed) return;

  if (!Object.keys(fakeData).length) {
    console.log('Cannot seed services as seed/fake-data.json doesn\'t have seed data.');
    return;
  }
  if (!services || !Object.keys(services).length) {
    console.log('Cannot seed services as feathers-gen-specs.json has no services.');
    return;
  }

  for (const serviceName in services) {
    if (services.hasOwnProperty(serviceName)) {
      const { name, adapter, path } = services[serviceName];
      // !<DEFAULT> code: seed_select
      const doSeed = adapter !== 'generic';
      // !end

      if (doSeed) {
        if (fakeData[name] && fakeData[name].length) {
          try {
            const service = app.service(path);

            // !<DEFAULT> code: seed_try
            const deleted = await service.remove(null);
            const result = await service.create(fakeData[name]);
            console.log(`Seeded service ${name} on path ${path} deleting ${deleted.length} records, adding ${result.length}.`);
            // !end
          } catch (err) {
            console.log(`Error on seeding service ${name} on path ${path}`, err.message);
          }
        } else {
          console.log(`Not seeding service ${name} on path ${path}. No seed data.`);
        }
      } else {
        console.log(`Not seeding generic service ${name} on path ${path}.`);
      }
    }
  }
  // !code: func_return // !end
}

// !code: funcs // !end
// !code: end // !end
