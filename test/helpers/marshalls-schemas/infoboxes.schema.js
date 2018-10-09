
// Define the Feathers schema for service `infoboxes`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Infoboxes',
  description: 'Infoboxes database.',
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
      faker: 'lorem.word'
    },
    description: {
      faker: 'lorem.paragraph'
    },
    type: {
      type: 'string',
      enum: ['basic', 'extended', 'pano-gallery']
    },
    primaryPhotoUrl: {
      faker: 'image.imageUrl'
    },
    primaryPhotoCoordinates: {},
    primaryPhotoUploadInfo: {},
    categories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'ID'
          },
          name: {},
          path: {}
        }
      }
    },
    location: {
      type: 'object',
      properties: {
        type: {
          default: 'Point'
        },
        coordinates: {
          type: 'array'
        }
      }
    },
    phone: {
      faker: 'phone.phoneNumber'
    },
    tourLink: {
      faker: 'internet.url'
    },
    learnMoreLink: {
      faker: 'internet.url'
    },
    meta: {}

    // !end
  },
  // !code: schema_more // !end
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    // !code: graphql_header
    name: 'Infobox',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Infoboxes',
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
