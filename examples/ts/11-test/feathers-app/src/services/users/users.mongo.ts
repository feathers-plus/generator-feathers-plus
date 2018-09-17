
/* tslint:disable:quotemark */
// Defines the MongoDB $jsonSchema for service `users`. (Can be re-generated.)
import merge from 'lodash.merge';
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: model
  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      email: {
        minLength: 8,
        maxLength: 40,
        faker: "internet.email",
        bsonType: "string"
      },
      firstName: {
        minLength: 2,
        maxLength: 15,
        faker: "name.firstName",
        bsonType: "string"
      },
      lastName: {
        minLength: 2,
        maxLength: 30,
        faker: "name.lastName",
        bsonType: "string"
      },
      password: {
        chance: {
          hash: {
            length: 60
          }
        },
        bsonType: "string"
      },
      roleId: {
        faker: {
          fk: "roles:random"
        },
        bsonType: "objectId"
      }
    },
    required: [
      "email",
      "firstName",
      "lastName",
      "roleId"
    ]
  },
  // !end
  // !code: moduleExports // !end
);

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
