
/* eslint-disable no-unused-vars */
// Metadata for forming raw SQL statements for GraphQL. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

let moduleExports = function sqlMetadata(app, options) {
  let { convertArgsToFeathers, convertArgsToOrderBy, convertArgsToWhere } = options;
  let makeOrderBy = convertArgsToOrderBy(options);
  let makeWhere = convertArgsToWhere(options);
  // !code: func_init // !end

  let returns = {

    Query: {
      fields: {
        // !code: metadata_query_fields // !end
      },
      // !code: metadata_query_more // !end
    },
  // !code: metadata_more // !end
  };

  // !code: func_return // !end
  return returns;
};

// !code: more // !end

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
