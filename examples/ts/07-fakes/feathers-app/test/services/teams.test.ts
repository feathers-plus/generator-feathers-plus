/// <reference types="mocha"/>
import assert from 'assert';
import app from '../../src/app';

describe('\'teams\' service', () => {
  it('registered the service', () => {
    const service = app.service('teams');

    assert.ok(service, 'Registered the service');
  });
});
