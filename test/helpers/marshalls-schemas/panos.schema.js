
// Define the Feathers schema for service `panos`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Panos',
  description: 'Panos database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required
    'name',
    'slug',
    'imageUrl'
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
      type: 'string',
      faker: 'address.city'
    },
    slug: {
      type: 'string',
      faker: {
        exp: `rec.name.toLowerCase().replace(' ', '-')`
      }
    },
    imageUrl: {
      type: 'string',
      faker: 'image.imageUrl'
    },
    uploadInfo: {
      type: 'object',
      properties: {}
    },
    location: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          default: 'Point'
        },
        coordinates: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          additionalItems: false,
          items: [
            {
              type: 'number',
              minimum: -180,
              maximum: 180
            },
            {
              type: 'number',
              minimum: -90,
              maximum: 90
            }
          ]
        }
      }
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    tagIds: {
      type: 'array',
      items: {
        type: 'ID'
      }
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
    name: 'Pano',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Panos',
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
