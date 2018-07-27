
const serviceSpecsToMongoose = require('../lib/service-specs-to-mongoose');
const assert = require('assert');
const usersSchema = require('./helpers/users.schema-enum');

describe('Creates Mongoose Schemas', function () {
  it('includes enum attributes', function () {
    const mongooseSchema = serviceSpecsToMongoose(usersSchema.schema);

    assert.deepEqual(mongooseSchema.roles.enum, [ 'admin' ], 'roles enum was correctly applied');

    assert.deepEqual(mongooseSchema.dept.enum, [ 'acct' ], 'dept enum was correctly applied');
  });
});
