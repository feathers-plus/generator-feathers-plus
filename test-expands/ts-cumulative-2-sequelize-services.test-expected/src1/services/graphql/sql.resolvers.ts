
/* tslint:disable no-unused-variable */
// Define GraphQL resolvers for forming raw SQL statements. (Can be re-generated.)
import { App } from '../../app.interface';
import { FGraphQLResolverMap } from 'feathers-hooks-common';

export interface SqlResolverFactoryOptions {
  dialect: string;
  executeSql: any;
  genAndRunSql: any;
}
// !code: imports // !end
// !code: init // !end

let moduleExports = function sqlResolvers(app: App, options: SqlResolverFactoryOptions) {
  let { dialect, executeSql, genAndRunSql } = options;
  let genRunSql = genAndRunSql(executeSql, { dialect }, options);

  const returns: FGraphQLResolverMap = {
    // !code: resolver_field_more // !end

    Query: {

      // !code: resolver_query_more // !end
    },
  };

  // !code: func_return // !end
  return returns;
};

// !code: more // !end

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
