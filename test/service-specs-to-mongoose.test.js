
const mongoose = require('mongoose');
const serviceSpecsToMongoose = require('../lib/service-specs-to-mongoose');
const assert = require('assert');
const usersSchema = require('./helpers/users.schema-enum');
const moviesSchema = require('./helpers/movie.schema-default');


describe('Creates Mongoose Schemas', function () {
  it('includes enum attributes', function () {
    const mongooseSchema = serviceSpecsToMongoose(usersSchema.schema);

    assert.deepEqual(mongooseSchema.roles[0].enum, [ 'admin' ], 'roles enum was correctly applied');

    assert.deepEqual(mongooseSchema.roles1[0].enum, [ 'admin' ], 'roles1 enum was correctly applied');

    assert.deepEqual(mongooseSchema.dept.enum, [ 'acct' ], 'dept enum was correctly applied');
  });
  it('includes default attributes', function () {
    const mongooseSchema = serviceSpecsToMongoose(moviesSchema.schema);

    assert.deepEqual(mongooseSchema.status.default,'active', 'status default value was correctly applied');

    assert.deepEqual(mongooseSchema.genre.default,'action', 'genre default value was correctly applied');

    assert.deepEqual(mongooseSchema.registerdDate.default, Date.now, 'registerdDate default value was correctly applied');

  });
  it('properly generates model for array of objects', function () {
    const mongooseSchema = serviceSpecsToMongoose(usersSchema.schema);
    assert.deepEqual(mongooseSchema.categories, [{
      name: String,
      code: { default: '1', type: Number }
    }], 'categories ');
  });
  it('includes attributes of property type ObjectId that references a model', function () {
    const mongooseSchema = serviceSpecsToMongoose(usersSchema.schema);
    assert.deepEqual(mongooseSchema.parentId, {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      nullable: true
    }, 'parentId attributes are correctly applied ');
  });
});
