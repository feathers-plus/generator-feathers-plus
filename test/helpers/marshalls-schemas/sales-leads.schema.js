
// Define the Feathers schema for service `salesLeads`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'SalesLeads',
  description: 'SalesLeads database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required
    'name',
    'email'
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
      faker: 'name.findName'
    },
    email: {
      type: 'string',
      faker: 'internet.email'
    },
    phone: {
      type: 'string',
      faker: 'phone.phoneNumber'
    },
    companyName: {
      type: 'string',
      faker: 'company.companyName'
    },
    businessId: {
      type: 'ID'
    },
    isSubscribedToNewsletter: {
      type: 'boolean',
      default: false
    },
    remoteIp: {
      type: 'string',
      faker: 'internet.ip'
    },
    callbackDateTime: {
      type: 'string',
      format: 'date-time'
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
    name: 'SalesLead',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'SalesLeads',
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
