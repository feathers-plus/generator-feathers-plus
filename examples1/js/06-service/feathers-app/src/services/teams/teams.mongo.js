
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `teams`. (Can be re-generated.)
const merge = require('lodash.merge');
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
      name: {
        bsonType: "string"
      },
      members: {
        items: {
          "0": {
            type: "string"
          },
          type: "ID"
        },
        bsonType: "array"
      }
    },
    required: [
      "name",
      "members"
    ]
  },
  // !end
  // !code: moduleExports // !end
);

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
