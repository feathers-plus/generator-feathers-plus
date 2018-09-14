
/// <reference types="mocha"/>
import feathers, { Params, Service, Application } from '@feathersjs/feathers';
import assert from 'assert';
import feathers from '@feathersjs/feathers';
import { join } from 'path';
import { readJsonFileSync } from '@feathers-plus/test-utils';
import hookApp1 from '../../src1/hooks/hook.app1';

// Get generated fake data
// tslint:disable-next-line:no-unused-variable
const fakeData = readJsonFileSync(join(__dirname, '../../seeds/fake-data.json')) || {};

describe('Test /hooks/hook.app1.integ.test.ts', () => {
  let app: Application, params: Params;
  // tslint:disable-next-line:no-unused-variable
  let service: Service<any>;

  beforeEach(() => {
    app = feathers();

    app.use('/test-service', {
      async create(data: any) {
        return data;
      }
    });

    app.service('/test-service').hooks({
      before: {
        create: hookApp1()
      }
    });

    service = app.service('/test-service');
    params = {
      user: (fakeData['users1'] || [])[0] || {
        email: 'test@example.com'
      }

    };
  });


  it('Hook exists', () => {
    assert(typeof hookApp1 === 'function', 'Hook is not a function.');
  });

  it('???', async () => {
    params.provider = undefined;
    assert(true);

    /*
    const result = await service.create({

    }, params);

    assert.deepEqual(user, {

    }, result);
    */
  });
});
