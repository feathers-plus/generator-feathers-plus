
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

> The `{ query: { query: graphalQueryStr } }` syntax is compatible with tools such as GraphiQL.

`$` is a reserved character in GraphQL.
So Feathers reserved words like $in, $sort, $skip, etc. cannot be used.
You can instead replace the `$` with a double underscore `__` and use
__in, __sort, __skip, etc. instead.

### Calls to Feathers services

> The following does not apply to BatchLoaders.

The `key` argument is used for Feathers' `id`.

The `query` and `params` arguments are merged for the Feathers `params` argument.
`graphql: true` is added to `params` to indicate the service call is part of a GraphQL query.

The returned result is Feathers compatible.
It will contain pagination information if the top level service is configured for pagination.

You will have to programmatically paginate services other than the top level one,
using __skip and __limit. 

### Proposal to support pagination for inner joins

#### Resolver paths

Let's use this as an example:
```js
'{
   findUser(query: {uuid: {__lt: 100000}}) {
     fullName
     posts(query: {draft: 0}) {
       body
       comments {
         body
       }
     }
   }
}'
```

At present a paginated result is returned if the top-level data-set was paginated.
The paginated info is only for that data-set, in this case the `user` records from the `findUser` call.
No information is provided regarding any pagination of the `post` records resulting from the `posts` call.

The following is a proposal to provide the missing pagination information.

We can analyze the AST of the Query string to produce a "resolver path" to identify when and why a resolver
is being called.
In the above example, the findUser resolver would produce a resolver path of
```json
[ 'findUser', '[User]!' ]
```

This 2-tuple means the resolver was called for the `findUser` GraphQL type,
and its expected to return a `[User]!` result.

Let's say findUser returned with 4 records.
We have to populate the posts for each, and each of the 4 populates would call the `posts` resolver.
This would result in the paths
```json
[ 'findUser', 0, 'User', 'posts', '[Post!]' ]
[ 'findUser', 1, 'User', 'posts', '[Post!]' ]
[ 'findUser', 2, 'User', 'posts', '[Post!]' ]
[ 'findUser', 3, 'User', 'posts', '[Post!]' ]
```

The 3-tuple `'findUser', n, 'User'` means the n-th record of the findUser result
(all of which are User GraphQL types)
followed by 2-tuple `'posts', '[Post!]'` which means that n-th record was populated by the post resolver,
resulting in a `[Post!]` result.

Now each of those posts has to be populated by their comments.
Let's say the first user had 2 posts, its resulting resolver paths would be
```json
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ]
```
and the other user records would have their own resultant paths.

In sum, these resolver paths would be produced
```json
[ 'findUser', '[User]!' ]
[ 'findUser', 0, 'User', 'posts', '[Post!]' ]
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 1, 'User', 'posts', '[Post!]' ]
// ...
[ 'findUser', 2, 'User', 'posts', '[Post!]' ]
// ...
[ 'findUser', 3, 'User', 'posts', '[Post!]' ]
// ...
```

#### Provide resolver path to service hooks

Feathers service hooks presently see `{ graphql: true }`
and so only know that the call is part of a GraphQL call.
This call be changed to `{ graphql: resolverPath }` so that the hook has more information
about the GraphQL call.

#### Return resolver pagination information

Feathers calls whose top-level is paginated return the result
```json
{
  total: 100,
  skip: 0,
  limit: 10,
  data: [ ]
}
```
This proposal will add a `pagination: [{...}, {...}]` to that.

Feathers calls whose top-level is not paginated return the resulting object.
This proposal would return the following **only if any inner pagination occurred**.
```json
{
  pagination: pagination: [{...}, {...}],
  data: [ /* the single resulting object */ ]
}
```

In both cases `pagination` would be an array of objects.
Each object contains pagination information for one resolver route.
and the elements would be in the order of executed resolvers as in the above example.

> Perhaps this is not the best design as it requires searching the array for desired population info.
A hash may be better where the prop is the serialized resolver route ?!?

It would look like
```json
[
  { route: [ 'findUser', '[User]!' ],
    args: query: {uuid: {__lt: 100000}}, 
    pagination: {
      total,
      skip,
      limit
    }
  }
]
```

Only resolver calls with paginated results would be included,
not every resolver call.
So the amount of information should be manageable.

The app can drill down to the pagination information it is interested in,
and use that to modify its __limit and __skip values in the GraphQL arguments.

> BatchLoaders cannot return such information.
In fact, **I'm not sure BatchLoaders** can support pagination without extreme contortion.

..

> **WHAT IS THE POINT OF THIS?**
Will an app actually rerun the **WHOLE** Query must to scroll on an inner paginated record?
Would it need another Query just to scroll those records and any joined records?

..

> **We cannot implement pagaination UNTIL WE HAVE AN ANSWER FOR THIS.**
