/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../src/app';

describe('\'roles\' service', () => {
  it('registered the service', () => {
    const service = app.service('roles');

    assert.ok(service, 'Registered the service');
  });
});
