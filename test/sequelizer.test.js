
const { assert } = require('chai');

const Sequelize = require('sequelize');
const Sequelizer = require('sequelizer');

const DataTypes = Sequelize.DataTypes;

describe('sequelizer.test', () => {
  it('converts json-schema', () => {

    const schema = {
      // !<DEFAULT> code: schema_header
      title: 'Xxx',
      description: 'Xxx database.',
      // !end
      // !code: schema_definitions // !end

      // Required fields.
      required: [
        // !code: schema_required
        'email',
        'password'
        // !end
      ],
      // Fields with unique values.
      uniqueItemProperties: [
        // !code: schema_unique
        'email'
        // !end
      ],

      // Fields in the model.
      properties: {
        // !code: schema_properties
        id: {type: 'string'},
        email: {type: 'string', format: 'email'},
        firstName: {type: 'string', minLength: 2, maxLength: 100, faker: 'name.firstName'},
        lastName: {type: 'string', minLenth: 2, maxLength: 100, faker: 'name.lastName'},
        password: { type: 'string', chance: { hash: {length: 60}}},
        roleId: {type: 'string', faker: {fk: 'roles: random'}}
        // !end
      },
      // !code: schema_more // !end
    };

    const expectedModel = {
      id: {
        type: DataTypes.TEXT,
        unique: false,
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true,
      },
      password: {
        type: DataTypes.TEXT,
        unique: false,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.TEXT,
        unique: false,
        allowNull: true,
      }
    };

    const actualModel = Sequelizer.fromJsonSchema(schema, null, {
      notNullFields: schema.required || [],
      uniqueFields: schema.uniqueItemProperties || [],
    });

    assert.deepEqual(actualModel, expectedModel);
  });

  it('converts array to jsonb', () => {
    const schema = {
      // Fields in the model.
      properties: {
        xx: {
          type: 'array',
          items: { type: 'string' } },
      },
    };

    const expectedModel = {
      xx: {
        type: DataTypes.JSONB,
        unique: false,
        allowNull: true,
      },
    };

    const actualModel = Sequelizer.fromJsonSchema(schema, null, {
      notNullFields: schema.required || [],
      uniqueFields: schema.uniqueItemProperties || [],
    });

    assert.deepEqual(actualModel, expectedModel);
  });

  it('converts object to jsonb', () => {
    const schema = {
      // Fields in the model.
      properties: {
        xx: {
          type: 'object',
          properties: {
            yy: { type: 'string' }
          }
        },
      },
    };

    const expectedModel = {
      xx: {
        type: DataTypes.JSONB,
        unique: false,
        allowNull: true,
      },
    };

    const actualModel = Sequelizer.fromJsonSchema(schema, null, {
      notNullFields: schema.required || [],
      uniqueFields: schema.uniqueItemProperties || [],
    });

    assert.deepEqual(actualModel, expectedModel);
  });
});