
/* tslint:disable no-unused-variable */
// Metadata for forming raw SQL statements for GraphQL. (Can be re-generated.)
import { App } from '../../app.interface';
import { SqlResolverMap } from './graphql.interfaces';

export interface SqlMetadataOptions {
  convertArgsToFeathers: any;
  convertArgsToOrderBy: any;
  convertArgsToWhere: any;
}
// !code: imports // !end
// !code: init // !end

let moduleExports = function sqlMetadata(app: App, options: SqlMetadataOptions) {
  let { convertArgsToFeathers, convertArgsToOrderBy, convertArgsToWhere } = options;
  let makeOrderBy = convertArgsToOrderBy(options);
  let makeWhere = convertArgsToWhere(options);
  // !code: func_init // !end

  let returns: SqlResolverMap = {

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
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
