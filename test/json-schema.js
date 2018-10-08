
const { assert } = require('chai');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');
const { inspect } = require('util');
const serviceSpecsExpand = require('../lib/service-specs-expand');
const serviceSpecsToTypescript = require('../lib/service-specs-to-typescript');
const serviceSpecsToMongoJsonSchema = require('../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../lib/service-specs-to-sequelize');

const mongooseTypeEquivalence = { // json-schema: mongoose
  'array': Array,
  'buffer': Buffer,
  'boolean': Boolean,
  'date': Date,
  'mixed': mongoose.Schema.Types.Mixed,
  'number': Number,
  'objectid': mongoose.Schema.Types.ObjectId,
  'string': String,
  'object': Object,
  'integer': Number,
  'ID': mongoose.Schema.Types.ObjectId // Our GraphQL custom scalar
};

const sequelizeTypeEquivalences = {
  'boolean': Sequelize.BOOLEAN,
  'enum': Sequelize.ENUM,
  'integer': Sequelize.INTEGER,
  'jsonb': Sequelize.JSONB,
  'real': Sequelize.REAL,
  'string': Sequelize.STRING,
  'text': Sequelize.TEXT,
  'date': Sequelize.DATE,
  'dateonly': Sequelize.DATEONLY,
};

describe('JSON-schema', () => {
  it('scaffolding works', () => {
    const specs = {
      services: {
        nedb1: { adapter: 'nedb' },
        nedb2: { adapter: 'nedb' },
        users1: { adapter: 'nedb' },
      }
    };

    const fakeFeathersSchemas = {
      nedb1: {
        properties: {
          id: { type: 'ID' },
          _id: { type: 'ID' },
          name: {},
          nedb2Id: { type: 'ID' }
        }
      },
      nedb2: {
        properties: {
          id: { type: 'ID' },
          _id: { type: 'ID' },
          name: {},
          nedb1Id: { type: 'ID' }
        }
      },
      users1: {
        properties: {
          name: { type: 'string' },
        }
      }
    };

    const expectedIypescriptTypes = {
      nedb1: ['_id: unknown', 'name: string', 'nedb2Id: unknown'],
      nedb2: ['_id: unknown', 'name: string', 'nedb1Id: unknown'],
      users1: ['name: string']
    };
    const expectedTypescriptExtends = {
      nedb1: [ '_id: any', 'nedb2Id: any'],
      nedb2: [ '_id: any', 'nedb1Id: any'],
      users1: [],
    };
    const expectedMongoJsonSchema = {
      nedb1: {
        bsonType: 'object',
        additionalProperties: false,
        properties: {
          _id: { bsonType: 'objectId' },
          name: { bsonType: 'string' },
          nedb2Id: { bsonType: 'objectId' }
        }
      },
      nedb2: {
        bsonType: 'object',
        additionalProperties: false,
        properties: {
          _id: { bsonType: 'objectId' },
          name: { bsonType: 'string' },
          nedb1Id: { bsonType: 'objectId' }
        }
      },
      users1: {
        bsonType: 'object',
        additionalProperties: false,
        properties: {
          _id: { bsonType: 'objectId' },
          name: { bsonType: 'string' },
        }
      },
    };
    const expectedMongooseSchema = {
      nedb1: {
        name: mongooseTypeEquivalence.string,
        nedb2Id: mongooseTypeEquivalence.objectid,
      },
      nedb2: {
        name: mongooseTypeEquivalence.string,
        nedb1Id: mongooseTypeEquivalence.objectid,
      },
      users1: {
        name: mongooseTypeEquivalence.string,
      },
    };
    const expectedSeqModel = {
      nedb1: {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: sequelizeTypeEquivalences.integer,
        },
        name: {
          type: sequelizeTypeEquivalences.text
        },
        nedb2Id: {
          type: sequelizeTypeEquivalences.integer,
        },
      },
      nedb2: {
        id: {
          type: sequelizeTypeEquivalences.integer,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: sequelizeTypeEquivalences.text
        },
        nedb1Id: {
          type: sequelizeTypeEquivalences.integer,
        },
      },
      users1: {
        name: {
          type: sequelizeTypeEquivalences.text
        },
      },
    };
    const expectedSeqFks = {
      nedb1: ['nedb2Id'],
      nedb2: ['nedb1Id'],
      users1: [],
    };

    const { mapping, feathersSpecs } = serviceSpecsExpand(specs, null, fakeFeathersSchemas);
    // inspector('...mapping', mapping);
    // inspector('...feathersSpecs', feathersSpecs);

    Object.keys(specs.services).forEach(name => {
      const specsService = specs.services[name];

      const { typescriptTypes, typescriptExtends } =
        serviceSpecsToTypescript(specsService, feathersSpecs[name], feathersSpecs[name]._extensions);
      // inspector(`\n\n.....${name} typescriptTypes`, typescriptTypes);
      // inspector(`.....${name} typescriptExtends`, typescriptExtends);

      assert.deepEqual(typescriptTypes, expectedIypescriptTypes[name], 'typescriptTypes wrong');
      assert.deepEqual(typescriptExtends, expectedTypescriptExtends[name], 'typescriptExtends wrong');

      const mongoJsonSchema = serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions);
      // inspector(`.....${name} mongoJsonSchema`, mongoJsonSchema);

      assert.deepEqual(mongoJsonSchema, expectedMongoJsonSchema[name], 'mongoJsonSchema wrong');

      const mongooseSchema = serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions);
      // inspector(`.....${name} mongooseSchema`, mongooseSchema);

      assert.deepEqual(mongooseSchema, expectedMongooseSchema[name], 'mongooseSchema wrong');

      const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);
      // inspector(`.....${name} seqModel`, seqModel);
      // inspector(`.....${name} seqFks`, seqFks);

      assert.deepEqual(seqModel, expectedSeqModel[name], 'seqModel wrong');
      assert.deepEqual(seqFks, expectedSeqFks[name], 'seqFks wrong');
    });
  });
});

// eslint-disable-next-line no-unused-vars
function inspector(desc, obj, depth = 6) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}