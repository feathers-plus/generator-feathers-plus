
// Define the Feathers schema for service `businesses`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Businesses',
  description: 'Businesses database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required
    'name'
    // !end
  ],
  // Fields with unique values.
  uniqueItemProperties: [
    // !code: schema_unique // !end
  ],

  // Fields in the model.
  properties: {
    // !code: schema_properties
    name: {
      faker: 'company.companyName'
    },
    phones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            faker: {
              exp: '["home", "work"][Math.floor(Math.random() * 2)]'
            }
          },
          number: {
            faker: 'phone.phoneNumber'
          }
        }
      }
    },
    emails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            faker: {
              exp: '["home", "work"][Math.floor(Math.random() * 2)]'
            }
          },
          email: {
            faker: 'internet.email'
          }
        }
      }
    },
    primaryContact: {
      faker: 'name.findName'
    },
    notes: {
      faker: 'lorem.paragraph'
    }
    // !end
  },
  // !code: schema_more // !end
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    // !code: graphql_header
    name: 'Business',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Businesses',
    //   uniqueKey: '_id',
    //   sqlColumn: {
    //     __authorId__: '__author_id__',
    //   },
    // },
    // !end
    discard: [
      // !code: graphql_discard // !end
    ],
    add: {
      // !<DEFAULT> code: graphql_add
      // __author__: { type: '__User__!', args: false, relation: { ourTable: '__authorId__', otherTable: '_id' } },
      // !end
    },
    // !code: graphql_more // !end
  },
}

// !code: more // !end

let moduleExports = {
  schema,
  extensions,
  // !code: moduleExports // !end
}

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
