
// Define the Feathers schema for service `teams`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Teams',
  description: 'Teams database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required // !end
  ],
  // Fields with unique values.
  uniqueItemProperties: [
    // !code: schema_unique // !end
  ],

  // Fields in the model.
  properties: {
    // !code: schema_properties // !end
  },
  // !code: schema_more // !end
};

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    // !code: graphql_header
        name: 'Team',
        service: {
            sort: { name: 1 },
        },
        // sql: {
        //   sqlTable: 'Teams',
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
      // !code: graphql_add
            members: { type: '[User!]', args: false, relation: { ourTable: 'memberIds', otherTable: '_id' },
                sort: { lastName: 1, firstName: 1 } },
            // !end
    },
    // !code: graphql_more // !end
  },
};

// !code: more // !end

let moduleExports = {
  schema,
  extensions,
  // !code: moduleExports // !end
};

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
