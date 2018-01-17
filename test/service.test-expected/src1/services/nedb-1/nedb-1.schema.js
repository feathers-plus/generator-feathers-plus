
// Define the Feathers schema for service `nedb1`. (Can be re-generated.)
//!code: imports //!end
//!code: init //!end

let schema = {
  $schema: 'http://json-schema.org/draft-05/schema',
  //!<DEFAULT> code: schema_header
  title: 'Nedb1',
  description: 'Nedb1 database.',
  //!end
  //!code: schema_definitions //!end
  required: [
    //!code: schema_required //!end
  ],
  properties: {
    //!code: schema_properties //!end
  },
  //!code: schema_more //!end
};

let extensions = {
  graphql: {
    //!<DEFAULT> code: graphql_header
    // name: 'Nedb1',
    // service: {
    //   sort: { __id__: 1 },
    // },
    // sql: {
    //   sqlTable: 'Nedb1',
    //   uniqueKey: '__id__',
    //   sqlColumn: {
    //     __authorId__: '__author_id__',
    //   },
    // },
    //!end
    discard: [
      //!code: graphql_discard //!end
    ],
    add: {
      //!<DEFAULT> code: graphql_add
      // __author__: { type: '__User__!', args: false, relation: { ourTable: '__authorId__', otherTable: '__id__' } },
      //!end
    },
    //!code: graphql_more //!end
  },
};

//!code: more //!end

let moduleExports = {
  schema,
  extensions,
  //!code: moduleExports //!end
};

//!code: exports //!end
module.exports = moduleExports;

//!code: funcs //!end
//!code: end //!end
