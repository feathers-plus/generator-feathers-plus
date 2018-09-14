/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../src1/app';

describe('\'nedb1\' service', () => {
  it('registered the service', () => {
    const service = app.service('nedb-1');

    assert.ok(service, 'Registered the service');
  });
});
