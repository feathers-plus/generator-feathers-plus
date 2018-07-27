/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../src1/app';

describe('\'users1\' service', () => {
  it('registered the service', () => {
    const service = app.service('users-1');

    assert.ok(service, 'Registered the service');
  });
});
