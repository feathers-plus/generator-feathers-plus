
## GraphQL

You are asked `Should this be served by GraphQL?` when you (re)generate a service.
This identifies which services you want included in the GraphQL endpoint.

### GraphQL extension

Additional information is required for each included service,
and this is provided in the schema with `extensions.graphql`.
```js
// cli-generator-example/src/services/comment/comment.schema.js
let schema = {
  // ...
  properties: {
    id: { type: 'ID' },
    _id: { type: 'ID' },
    uuid: { type: 'ID' },
    authorUuid: { type: 'ID' },
    postUuid: { type: 'ID' },
    body: {},
    archived: { type: 'integer' }
  },
};

let extensions = {
  graphql: {
    name: 'Comment',
    service: { sort: { uuid: 1 } },
    sql: {
      sqlTable: 'Comments',
      uniqueKey: 'uuid',
      sqlColumn: {
        authorUuid: 'author_uuid',
        postUuid: 'post_uuid',
      },
    },
    discard: [],
    add: {
      author: { type: 'User!', args: false, relation: { ourTable: 'authorUuid', otherTable: 'uuid' } },
      likes: { type: '[Like!]', args: false, relation: { ourTable: 'uuid', otherTable: 'commentUuid' }  },
    },
  },
};

// Allows GraphQL queries like
{
  getComment(key: 10) {
    uuid
    authorUuid
    postUuid
    body
    archived
    author {
      fullName
    }
    likes {
      author {
        fullName
      }
      comment {
        body
      }
    }
  }
}

// with results like
{
  "getComment": {
    "uuid": "10",
    "authorUuid": "0",
    "postUuid": "90",
    "body": "Comment 1",
    "archived": 0,
    "author": {
      "fullName": "John Szwaronek",
    },
    "likes": [
      {
        "author": {
          "fullName": "Jessica Szwaronek",
        },
        "comment": {
          "body": "Comment 1",
        }
      },
      // ...
    ]
  }
}
```

- `name` - The name of the GraphQL type for this service.
It defaults to the service name with the first letter capitalized.
- `service` - This is required if you want to generate GraphQL resolvers using Feathers service,
alone or with BatchLoaders.
  - `sort` - The sort criteria used when this service is the top level of a GraphQL Query.
- `sql` - This is required if you want to generate GraphQL resolvers which use raw SQL statements.
  - `sqlTable`: The name of the SQL table in the database.
  - `uniqueLey`: The name of the column containing the unique key for records in the table.
  - `sqlColumn`: A hash containing the map of field names in comment.schema.js to column names in the SQL table.
- `discard`: Field names to exclude from GraphQL queries.
- `add`: Relations between this service and other services.
  - property name, e.g. `author`: The name of the GraphQL type for this resolver. 
  - `type`: The GraphQL type the resolver will return, along with its cardinality.
    - `User`    - a User type or `null`.
    - `User!`   - a User type. `null` is not allowed.
    - `[User]`  - an array of User types, some of which may be null.
    - `[User!]` - an array of User types.  
  - `type`: It may also be GraphQL scalar type such as `String`.
  In this case its assumed to be a calculated field.
  You will customize the calculation by modifying its resolver in, say,
  graphql/service.resolvers.js.  
  - `args`: Resolvers may optionally have parameters, for example
  `getComment` above has `key`, while `author` and `likes` have none.
  A value of `false` eliminates parameters, while `true` or `undefined` allows them.
  The parameters are the same as the Feathers service API:
    - `key`: The same as the Feathers service `id` as used in `name.get(id)`.
    - `query`: The same as the Feathers service query, e.g. `name.find({ query: query })`.
    - `params`: The same as the Feathers service params, e.g. `name.find(params)`.
    The `query` param will be merged into any `params` param.  
```js
{
  getUser(key: 1) {
    uuid
    firstName
    lastName
    fullName
    email
    posts(query: {draft: 0}) {
      uuid
      authorUuid
      body
      draft
    }
```       
  - `relation`: How the tables relate to one another.
    - `ourTable`: The field in our schema which matches to the `type` schema.
    - `otherTable`: The field in the `type` schema which matches the field in our schema.
    
### Generating the GraphQL endpoint

You generate the GraphQL service by running `feathers-plus generate graphql`.
This generates the `graphql` Feathers service.
The prompts allow you to choose the name of the endpoint.

These modules are always created:
- `graphgl/service.resolvers.js`: Resolvers using Feathers services alone.
- `graphgl/batchloader.resolvers.js`: Resolvers using Feathers services and BatchLoaders.
- Several modules are created for resolvers using raw SQL statements.
  - `graphql/sql.metadata.js`: Additional information required to form the raw SQL statements.
  [join-monster](https://join-monster.readthedocs.io/en/latest/) is used for this,
  and you definitely need to understand its documentation.
  - `graphql/sql.resolvers.js`: Resolvers which call join-monster routines.
  - `graphql/sql.execute.js`: You will have to modify this module.
  It defaults to calling `sqlite` tables.

You are asked which type of resolvers you want to use when generating the endpoint.
You can choose any for which your schemas have the required information.
You can change the the resolvers used by regenerating the endpoint.

### Generated queries

GraphQL, in our opinion, is great for queries.
However we feel Feathers is cleaner and easier for mutations and subscriptions.

Two GraphQL queries are generated for each service.
They would be `getComment` and `findComment` for the `comment`.
- `getComment` requires the `key` parameter. The `params` one is optional.
- `findComment` would usually include a `query` parameter. The `params` one is optional.

You call the queries using `app.service('graphql').find({ query: { query: graphalQueryStr } })`,
where `graphalQueryStr` is a GraphQL query **string** such as
```js
'{
   getUser(key: 1) {
     uuid
     firstName
     lastName
     fullName
     email
     posts(query: {draft: 0}) {
       uuid
       authorUuid
       body
       draft
     }
   }
}'
```

`$` is a reserved character in GraphQL.
So Feathers reserved words like $in, $sort, $skip, etc. cannot be used.
You can instead replace the `$` with a double underscore `__` and use
__in, __sort, __skip, etc. instead.

The returned result is Feathers compatible.
It will contain pagination information if the top level service is configured for pagination.

You will have to programmatically paginate services other than the top level one,
using __skip and __limit.