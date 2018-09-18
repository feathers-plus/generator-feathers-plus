
const serviceSpecsToMongoose = require('../lib/service-specs-to-mongoose');
const assert = require('assert');
const usersSchema = require('./helpers/users.schema-enum');
const moviesSchema = require('./helpers/movie.schema-default');


describe('Creates Mongoose Schemas', function () {
  it('includes enum attributes', function () {
    const mongooseSchema = serviceSpecsToMongoose(usersSchema.schema);

    assert.deepEqual(mongooseSchema.roles.enum, [ 'admin' ], 'roles enum was correctly applied');

    assert.deepEqual(mongooseSchema.roles1.enum, [ 'admin' ], 'roles1 enum was correctly applied');

    assert.deepEqual(mongooseSchema.dept.enum, [ 'acct' ], 'dept enum was correctly applied');
  });
  it('includes default attributes', function () {
    const mongooseSchema = serviceSpecsToMongoose(moviesSchema.schema);

    assert.deepEqual(mongooseSchema.status.default,'active', 'staus default value was correctly applied');

    assert.deepEqual(mongooseSchema.genre.default,'action', 'genre default value was correctly applied');
    
    assert.deepEqual(mongooseSchema.registerdDate.default, Date.now, 'registerdDate default value was correctly applied');
   
  });
});
