---
pageClass: custom-api-page
---
# API

<!--=============================================================================================-->

## Generated Modules

### src/service-name/service-name.validate.?s

This module exports functions for validating data for that service name.
- **Exports**

  - `{Object} create`
  - `{Object} update`
  - `{Object} patch`
  - `{Function} validateCreate`
  - `{Function} validateUpdate`
  - `{Function} validatePatch`
  - `{Function} quickValidate`

Argument | Type | Description
:-|:-:|:-|:-
`create` | `Object` |  JSON-schema for validation on create.
`update` | `Object` |  JSON-schema for validation on update.
`patch` | `Object` |  JSON-schema for validation on patch.
`validateCreate` | `Function` |  Hook function for validation on create. Signature is `validateCreate(ajvOptions)`.
`validateUpdate` | `Function` |  Hook function for validation on update. Signature is `validateUpdate(ajvOptions)`.
`validatePatch` | `Function` |  Hook function for validation on patch. Signature is `validatePatch(ajvOptions)`.
`quickValidate` | `Function` |  Generic validation function. Signature is `quickValidate(method, data, ajvOptions)`.

`validate...` | Parameters | Default |Description
:-|:-|:-:|:-
. | `{Object} ajvOptions` |  | Options for [ajv](https://github.com/epoberezkin/ajv).

`quickValidate` | Parameters | Default |Description
:-|:-|:-:|:-
. | `{String} method` |  | Type of validation: `create`, `update` or `patch`.
. | `{Object} data` |  | The data record.
. | `{Object} ajvOptions` |  | Options for [ajv](https://github.com/epoberezkin/ajv).

- **Example**

Obtaining the JSON-schema.

<collapse hidden title="JSON-schema">

```js
const { create } = require('path/to/src/users/users.validate');
console.log(create);
```

```js
{
    title: "Users",
    description: "Users database.",
    required: [
      "email",
      "firstName",
      "lastName"
    ],
    uniqueItemProperties: [],
    properties: {
      _id: {
        type: "string"
      },
      email: {
        type: "string"
      },
      firstName: {
        type: "string"
      },
      lastName: {
        type: "string"
      }
    }
  }
```

</collapse>

Configuring hooks.

<collapse hidden title="Hooks">

```js
const { validateCreate } = require('path/to/src/users/users.validate');
module.exports = {
  before: {
    create: validateCreate(),
  }
};  
```

</collapse>

Generic validation anywhere.

<collapse hidden title="Generic validation">

```js
const { quickValidate } = require('path/to/src/users/users.validate');
const isValid = quickValidate(
  'create', { firstName: ..., lastName: ..., email: ... }, ajvOptions
);
```

</collapse>

- **Details**

  There are some good [tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
  on using JSON-Schema with [Ajv](https://github.com/epoberezkin/ajv).
  
  The hook functions call the common hook [validateSchema](https://feathers-plus.github.io/v1/feathers-hooks-common/index.html#validateschema).
  
  There is no validation module for the service for the GraphQL endpoint.

<!--=============================================================================================-->

## Service Adapters

### graphql

The custom service handling GraphQL requests.

- **Arguments**

  - `{Object} options`

Argument | Type | Default | Description
:-|:-:|:-|:-
`options` | `Object` |  | Options to configure the service

`options` | Property | Used for |Description
:-|:-|:-:|:-
. | `{Function} schemas` | all |Returns GraphQL schemas
. | `{Function} resolvers` | all | Returns GraphQL resolver functions.
. | `{Function} sqlJoins` | SQL | Returns metadata for join-monster.
. | `{String} dialect` | SQL | [Dialect](https://join-monster.readthedocs.io/en/latest/dialects/) of SQL to generate.
. | `{Function} executeSql` | SQL | Execute raw SQL statement. Signaure is `executeSql(sqlString)`.
. | `{Boolean} logSQL` | SQL | Whether to log raw SQL statements to the console.
. | `{Function} openDb` | SQL | Optional function to explicitly open the SQL database. Usually Feathers opens the database automatically.
. | `{Array(String) | String} extraAuthProps` | Non-SQL | Optional additional properties to copy from /graphql `params` when calling Feathers services.

- **Example**

<collapse hidden title="Using Feathers service calls or batchloaders.">

```js
// src/services/graphql/graphql.service.js
const createService = require('@feathers-plus/graphql');
// Feathers hooks like cli-generator-example/js-sequelize-services/src/services/graphql/graphql.hooks.js
const hooks = require('./graphql.hooks');
// GraphQL schema like .../services/graphql/graphql.schemas.js
const schemas = require('./graphql.schemas');
// GraphQL resolver functions like .../services/graphql/service.resolvers.js or .../services/graphql/batchloader.resolvers.js
const resolvers = require('./service.resolvers');

module.exports = function () {
  const app = this;

  let options = {
    schemas,
    resolvers,
  };

  const createdService = createService(options);
  app.use('/graphql', createdService);

  const service = app.service('/graphql');
  service.hooks(hooks);
};
```

</collapse>

<collapse hidden title="Using SQL statements.">

```js
// src/services/graphql/graphql.service.js
const createService = require('@feathers-plus/graphql');
// Feathers hooks like cli-generator-example/js-sequelize-sql/src/services/graphql/graphql.hooks.js
const hooks = require('./graphql.hooks');
// GraphQL schema like .../services/graphql/graphql.schemas.js
const schemas = require('./graphql.schemas');
// GraphQL resolver functions like .../services/graphql/sql.resolvers.js
const resolvers = require('./service.resolvers');
// join-monster metadata like .../services/graphql/sql.metadata.js
const sqlJoins = require('./sql.metadata');
// Module to execute raw SQL statements like .../services/graphql/sql.execute.sequelize.js or .../services/graphql/sql.execute.knex.js or .../services/graphql/sql.execute.custom.js
const sqlExecute = require('./sql.execute.sequelize');

module.exports = function () {
  const app = this;
  let { dialect, executeSql, openDb } = sqlExecute(app);

  if (!dialect) {
    throw new Error('services/graphql/sql.execute.js has not been configured.');
  }

  const options = {
    schemas,
    resolvers,
    sqlJoins,
    
    dialect,
    executeSql,
    openDb,
    logSql: false,
  };

  // Initialize our service with any options it requires.
  const createdService = createService(options);
  app.use('/graphql', createdService);

  const service = app.service('/graphql');
  service.hooks(hooks);
};
```

</collapse>

  
- **Details**

  The custom GraphQL schema type **JSON** is automatically added to (copies of) the **schemas** and **resolvers** options.
  It supports valid JSON values, allowing arguments like `query: { dept: 'a' }`.
  
  **option** may contain these optional properties.
  - **{Array(String) | String} extraAuthProps** - See **context** below.
  - **{Function} openDB** - Function will be called to open SQL database. Feathers will usually automatically open the database.
  
  These properties are added to (a clone of) **options** and passed to the GraphQL resolver function module.
  - **convertArgsToFeathers**
  - **convertArgsToParams**
  - **convertArgsToOrderBy** - creates SQL ORDER clause from GraphQL arguments.
  - **convertArgsToWhere** - creates SQL WHERE clause from GraphQL arguments.
  - **extractAllItems**
  - **extractFirstItem**
  - **feathersBatchLoader**
  - **genAndRunSql**
  - **resolverTypes** - resolver for JSON scalar type.
  - **schemaTypes** - schema for JSON scalar type.
  
  ```js
  // .../services/graphql/service.resolvers.js or
  // .../batchloader.resolvers.js or 
  // .../sql.resolvers.js
  module.exports = function (app, options) { /* ... */ };
  ```
  
- **context**  
  
  The **content** passed to the GraphQL resolver function calls contains
  - **app** - The Feathers **app**
  - **provider** - **params.provider** from the /graphql service call.
  - **user** - **params.user** from the /graphql service call.
  - **authenticated** - **params.authenticated** from the /graphql service call.
  - prop names contained in the **extraAuthProps** option - Taken from the same prop names in the /graphql service call.
  - **batchLoaders** - An object, initially empty, to cache BatchLoaders created for this GraphQL request.
  - **cache** - An object, initially empty, to cache the contents of select tables.
   For example, all the records in **users** would be cached if another table contains an array of foreign keys to it,
   e.g. the **members** table contains the array `memberIds: [user1, user2, ...]`.
   A cache is used as the Feathers common database API cannot select these records in **users**,
   so the cache is scanned to select them.
   
   <collapse hidden title="GraphQL resolver function calls.">
   
   ```js
   // .../services/graphql/service.resolvers.js or .../batchloader.resolvers.js or .../sql.resolvers.js
   module.exports = function (app, options) {
     return {
       User: {
         comments:
           (parent, args, content, ast) => {
             const feathersParams = convertArgs(args, content, ast, {
               query: { authorUuid: parent.uuid, $sort: undefined }, paginate: false
             });
             return comments.find(feathersParams).then(extractAllItems);
           }
         },
        Query: {
          getUser(parent, args, content, ast) {
            const feathersParams = convertArgs(args, content, ast);
            return users.get(args.key, feathersParams).then(extractFirstItem);
          },
          findUser(parent, args, content, ast) {
            const feathersParams = convertArgs(args, content, ast, {
              query: { $sort: {   uuid: 1 } }
            });
            return users.find(feathersParams)
              .then(paginate(content)).then(extractAllItems);
          },        
        }  
     };
   
     function paginate(content) {
       return result => {
         content.pagination = !result.data ? undefined : {
           total: result.total,
           limit: result.limit,
           skip: result.skip,
         };
   
         return result;
       };
     }
   };
   ```
   
   </collapse>
   
- **Errors**
   
   GraphQL swallows any other errors if it throws during initialization for a new request.
   That GraphQL error will be thrown as a Feathers **BadRequest** error.
   
   The service adapter will reformat other GraphQL errors so they are acceptable to Feathers.
   Specifically the Feathers message will identify the line number, column number and path in the GraphQL request of the **first** error detected by GraphQL.
   
   :::tip GraphQL errors
   GraphQL error messages can be obtuse.
   :::
   
<!--=============================================================================================-->

## Utility Routines

These routines are used by the generated code handling GraphQL requests.
You may be using them should you customize the generated code.

<!--=============================================================================================-->
### convertArgsToFeathers

Returns a function which will convert the arguments in a GraphQL resolver call into the `params` for a Feathers service call.

- **Arguments**

  - `{Array(String) | String} extraAuthPropNames`

Argument | Type | Default | Description
:-|:-:|:-|:-
`extraAuthPropNames` | `{Array(String) | String}` | `[]` | The names of additional authentication properties from the GraphQL call to include in the Feathers service calls.

- **Returns**

  - `{Function} argsToParamsFunction`
    
Argument | Type | Description
:-|:---:|:-
`argsToParamsFunction` | `Function` |  A function with signature `(args, content, ast, ...moreParams)`.

- **Example**

```js
// src/services/graphql/service.resolvers.?s or /batchloader.resolvers.?s
let moduleExports = function (app, { convertArgsToFeathers }) {
  const convertArgs = convertArgsToFeathers('isVerified');
  
  return {
    Role: {
      users: (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { roleId: parent._id, $sort: undefined }, paginate: false
          });
          return users.find(feathersParams).then(extractAllItems);
      },
    }
  };
}
```
  
- **Details**

  convertArgsToFeathers constructs the `params` for a Feathers service call containing
  - **provider** - `context.provider` from the GraphQL's service call,
  - **user** - `context.user`,
  - **authenticated** - `context.authenticated`,
  - **graphql** - The [resolver path](../guide#resolver-paths) for the call,
  - **query** - `args.query`.
  - property values provided by `moreParams`,
  - property names specified by `extraAuthPropNames`.

<!--=============================================================================================-->
### convertArgsToParams

Replace all property names starting with `__` with ones starting with `$`.

- **Arguments**

  - `{Object} obj`

Argument | Type | Default | Description
:-|:-:|:-|:-
`obj` | `{Object}` | | The object containing the properties.

- **Returns**

  - `{Object} $obj`
    
Argument | Type | Description
:-|:---:|:-
`$obj` | `Object` |  The object with renamed properties.
- **Example**

```js
// src/services/graphql/service.resolvers.?s or /batchloader.resolvers.?s
let moduleExports = function (app, { convertArgsToParams }) {
  console.log(
    convertArgsToParams({ a: 1, __b: { __c: 3, d: 4 } }) // { a: 1, $b: { $c: 3, d: 4 } }
  );
}
```
  
- **Details**

  This function is not directly called within the generated code.
  It is called by **convertArgsToFeathers**.
  
  A **null** or **undefined** object is returned as is.

<!--=============================================================================================-->
### extractAllItems

Returns an array of the records returned by the service call.

- **Arguments**

  - `{Object} serviceCallResult`

Argument | Type | Default | Description
:-|:-:|:-|:-
`serviceCallResult` | `Object` |  | The result of a Feathers service call.

- **Returns**

  - `{Array(Object) | null} records`
    
Argument | Type | Description
:-|:---:|:-
`records` | `Array(Object) | null` |  The records contained in the service call.   

- **Example**

```js
// src/services/graphql/service.resolvers.?s or /batchloader.resolvers.?s
let moduleExports = function (app, { extractAllItems }) {
  const userRecords = app.service('users').find()
    .then(result => extractAllItems(result));
}
```
  
- **Details**

  Returns an array of the records returned by the service call.
  The array may have 0 elements.
  
  `null` is returned if `serviceCallResult` or `serviceCallResult.data` is falsey.

<!--=============================================================================================-->
### extractFirstItem

Returns the single record returned by the service call.

- **Arguments**

  - `{Object} serviceCallResult`

Argument | Type | Default | Description
:-|:-:|:-|:-
`serviceCallResult` | `Object` |  | The result of a Feathers service call.

- **Returns**

  - `{Object | null} record`
    
Argument | Type | Description
:-|:---:|:-
`record` | `Object | null` |  The single record contained in the service call.   

- **Example**

```js
// src/services/graphql/service.resolvers.?s or /batchloader.resolvers.?s
let moduleExports = function (app, { extractFirstItem }) {
  const userRecords = app.service('users').get(0)
    .then(result => extractFirstItem(result));
}
```
  
- **Details**

  Returns an array of the records returned by the service call.
  The array may have 0 elements.
  
  `null` is returned if `serviceCallResult` or `serviceCallResult.data` is falsey,
  or if there is no record.
  
  Throws if there are multiple records.

<!--=============================================================================================-->
### feathersBatchLoader

Creates a [batch-loader](https://feathers-plus.github.io/v1/batch-loader/). 

- **Arguments**

  - `{String} resolverName}`
  - `{String} graphqlType`
  - `{String|Function} serializeRecordKey1`
  - `{Promise} getRecords`
  - `{Number} maxBatchSize`
  - `{Number} maxCacheSize`
  - `{String|Function} serializeBatchLoaderKey1`

Argument | Type | Default | Description
:-|:-:|:-|:-
`resolverName` | `String` |  | Name of resolver. Only used in info/error logs.
`graphqlType` | `String` |  | Type of GraphQL result to return for each BatchLoader key
`serializeRecordKey1` | `{String|Function}` |  | Serialize record key. Return serialized key from record, identical to that produced by serializeBatchLoaderKey1. `Function` - record => serialized key. `String` - Converts to record => record[serializeRecordKey1].toString();
`getRecords` | `Promise` |  | Feathers call to read records given [keys] from BatchLoader. Can return a '.get()' object or array, else a paginated or non-paginated '.find()' object. An error is caught and processed as an empty array.
`maxBatchSize` | `Number` |  | Maximum number of keys `getRecords` is called with.
`maxCacheSize` | `Number` |  | Maximum number of items in the cache. Will use LRU cache.
`serializeBatchLoaderKey1` | `{String | Function}` |  | Serialize key from BatchLoader.load(), identical to that produced by serializeRecordKey1. `Function` - key => serialized key e.g. '1' or '{"name":"a","age":20}'. `String` - Converts to key => key.toString();

`graphqlType` | Value | Description
---|---|---
. | `[!]!` | required collection of required elements
. | `[!]` | optional collection of required elements
.  | `[]` | optional collection of optional elements
.  | `!` | required object
.  | `` | optional object

- **Returns**

  - `{Function} batchLoader`
    
Argument | Type | Description
:-|:---:|:-
`batchLoader` | `Function` |  A [batch-loader](https://feathers-plus.github.io/v1/batch-loader/).   

- **Example**

```js
// src/services/graphql/batchloader.resolvers.?s
let moduleExports = function batchLoaderResolvers(app, options) {
  let { convertArgsToFeathers, feathersBatchLoader: { feathersBatchLoader } } = options;
  
  const convertArgs = convertArgsToFeathers([]);
  const defaultPaginate = app.get('paginate');
  const maxBatchSize = defaultPaginate && typeof defaultPaginate.max === 'number' ?
      defaultPaginate.max : undefined;
  
  const roleUsersBatchLoader = feathersBatchLoader('Role.users', '[!]', 'roleId',
    keys => {
      const feathersParams = convertArgs(args, content, null, {
        query: { roleId: { $in: keys }, $sort: undefined },
        _populate: 'skip', paginate: false
      });
      return users.find(feathersParams);
    },
    maxBatchSize // Max #keys in a BatchLoader func call.
  );
}
```

<!--=============================================================================================-->
### genAndRunSql

Runs a raw SQL statement.

- **Arguments**

  - `{Function} execSql`
  - `{Object} jmOptions`
  - `{Object} options`

Argument | Type | Default | Description
:-|:-:|:-|:-
`execSql` | `Function` |  | Function to execute a raw SQL statement.
`jmOptions` | `{Object}` | `{}` | Options for `join-monster`.
`options` | `{Object}` | `{}` | `{ logSQL }` will log the raw SQL statements to the console.

- **Returns**

  - `{Function} callJoinMonster
    
Argument | Type | Description
:-|:---:|:-
`callJoinMonster` | `Function` |  A function with signature `(context, info)`.   

- **Example**

```js
// src/services/graphql/sql.resolvers.?s
let moduleExports = function sqlResolvers(app, options) {
  let { dialect, executeSql, genAndRunSql } = options;
  let genRunSql = genAndRunSql(executeSql, { dialect }, options);
  
  return {
    Query: {
      getUser: (parent, args, content, ast) => genRunSql(content, ast),
      findUser: (parent, args, content, ast) => genRunSql(content, ast)
    }
  };  
}
```

<!--=============================================================================================-->
