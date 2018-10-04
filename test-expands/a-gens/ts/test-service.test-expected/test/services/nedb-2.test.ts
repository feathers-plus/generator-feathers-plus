/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../src1/app';

describe('\'nedb2\' service', () => {
  it('registered the service', () => {
    const service = app.service('nedb-2');

    assert.ok(service, 'Registered the service');
  });
});
