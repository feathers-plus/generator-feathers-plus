# Guide

## Regenerating apps

@feathers-plus/cli, a.k.a. "cli-plus", persists a definition of the app in `project-name/feathers-gen-specs.json`.
This contains primarily the responses provided to the prompts used to create the app.

An example is:
```json
{
  "options": {
    "ver": "1.0.0",
    "inspectConflicts": false,
    "semicolons": true,
    "freeze": [],
    "ts": false
  },
  "app": {
    "name": "GraphQL-test",
    "description": "Test Feathers GraphQL adapter.",
    "src": "src",
    "packager": "npm@>= 3.0.0",
    "providers": [
      "rest",
      "socketio"
    ]
  },
  "services": {
    "users": {
      "name": "users",
      "nameSingular": "user",
      "fileName": "users",
      "adapter": "nedb",
      "path": "/users",
      "isAuthEntity": true,
      "requiresAuth": true,
      "graphql": true
    },
    "comments": {
      "name": "comments",
      "nameSingular": "comment",
      "fileName": "comments",
      "adapter": "nedb",
      "path": "/comments",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "likes": {
      "name": "likes",
      "nameSingular": "like",
      "fileName": "likes",
      "adapter": "nedb",
      "path": "/likes",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "posts": {
      "name": "posts",
      "nameSingular": "post",
      "fileName": "posts",
      "adapter": "nedb",
      "path": "/posts",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "relationships": {
      "name": "relationships",
      "nameSingular": "relationship",
      "fileName": "relationships",
      "adapter": "nedb",
      "path": "/relationships",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "permissions": {
      "name": "permissions",
      "nameSingular": "permission",
      "fileName": "permissions",
      "adapter": "sequelize",
      "path": "/permissions",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": false
    }
  },
  "authentication": {
    "strategies": [
      "local"
    ],
    "entity": "users"
  },
  "connections": {
    "nedb": {
      "database": "nedb",
      "adapter": "nedb",
      "connectionString": "nedb://../data"
    },
    "sequelize": {
      "database": "sqlite",
      "adapter": "sequelize",
      "connectionString": "sqlite://data/db.sqlite"
    }
  },
  "middlewares": {
    "mw1": {
      "path": "*",
      "camel": "mw1",
      "kebab": "mw-1"
    },
    "mw2": {
      "path": "mw2",
      "camel": "mw2",
      "kebab": "mw-2"
    }
  },
  "graphql": {
    "path": "/graphql",
    "strategy": "sql",
    "requiresAuth": false,
    "name": "graphql"
  }
}
```

With this, and any custom code you entered in your app,
Cli-plus can regenerate part of, or all of the app at any time.
Let's say you originally run `generate app` selecting only `socket.io` as a transport.
Later on you find a need for `REST`.
You can just rerun `generate app` and select both transports, and the code will be updated.

Cli-plus will be updated over time, fixing issues and adding enhancements.
You can include these enhancements in your app by simply running `generate all` and
the entire app will be updated.
Most of the time this'll "just work".

::: tip
Your app can obtain information about the app at run-time by reading `feathers-gen-specs.json`.
It can, for example, determine the adapter used by a service and then use that information to
decide which hooks to run.
:::

::: tip
`feathers-gen-specs.json` combined with the output from `generate codelist` completely
describe the generated modules. The generator can re-generate the project with this information.
:::


## Additional generators

Cli-plus comes with generators not in @feathersjs/cli.
See the Get Started docs for details.

### feathers-plus generate options

JavaScript or TypeScript are generated based on one of the prompts.
Another prompt determines if statements are terminated by semicolons or not.
You can view on the console the difference between a new module and its previous version with another.
This is a good way to understand what changes are being made.

The generator creates a few modules with default contents,
after which it will not change them.
This leaves you free to modify them as you wish.

You can optionally `freeze` additional modules by adding their paths to
`options.freeze` in `my-app/feathers-gen-specs.json`, e.g.
`src/services/comments/comments/validate.js`.
The generator will not change nor remove these modules.

#### Converting between JavaScript and TypeScript

You can convert an existing generated project from JavaScript to TypeScript, or vice versa.
First run `generate options` and change to the language you want to convert to.
Then run `generate all`.

The generator will recode the project, install any newly required dependencies,
and then remove the modules of the original language.

Your custom code is not transpiled.
A statement containing TypeScript tags will not be converted to correct JavaScript.
You have to handle that yourself.

:::tip
Modules of both languages cannot exist at the same time,
as their duplicate custom code would be combined by the generator.
:::

You have to manually recode any modules you `froze` and remove the one in the original language.

:::warning
**Back up your project** before converting.
:::

### feathers-plus generate all

This regenerates the entire project.
Its a good way to refresh your project with the latest generator templates and bug fixes.

### feathers-plus generate codelist

This lists all the custom code in the project.
This list, when combined with `feathers-gen-specs.json`, completely defines what the
generated modules do.

## Feathers Service Models

### Writing JSON-schema

Here is a typical JSON-schema which contains no field validation:
```javascript
const productJsonSchema = {
    type: 'object',
    properties: {
        _id: { oneOf: [{ type: 'string' }, { type: 'object' }] }, // handle both MongoDB and NeDB
        checked: { type: 'boolean' },
        name: { type: 'string' },
        price: { type: 'number' },
        tags: {
            type: 'array',
            items: { type: 'string' },
        },
        updatedAt: { type: 'number', format: 'date-time', default: Date.now },
    },
}
```

Feathers Models defaults the `type` property to `string`, so you can write more concisely:
```javascript
const productJsonSchema = {
    properties: {
        _id: { type: 'ID' },
        checked: { type: 'boolean' },
        name: {},
        price: { type: 'number' },
        tags: { items: {} },
        updatedAt: { format: 'date-time', default: Date.now },
    },
}
```

As you can see, JSON-schema is fairly straightforward.
It also has extensive capabilities for validating your data.

:::tip
You should read
[this excellent tutorial](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
on JSON-schema written by the author of
[`ajv`](https://github.com/epoberezkin/ajv).
The Feathers common hook
[`validateSchema`](../../api/hooks-common#validateSchema.md)
uses JSON-schemna and `ajv` to validate data.
:::

:::tip
We are not certifying the utilities and websites mentioned below work flawlessly.
They are part of the JSON-schema ecosystem and may prove useful.
We welcome your feedback on them.
:::

### $ref: Modularizing definitions

The field `createdAt` may be used in several schemas.
It would be advantageous to define its characteristics
-- such as its minLength and maxLength --
in one place rather than everywhere its used.

We can do this with the `$ref` keyword.
```json
// src/services/comment/comment.schema.js refers to an external property definition
{
  properties: {
    // ...
    createdAt: { $ref: 'common.json#/definitions/created_at'}
  }
}

// src/refs/common.json contains the definition
{
  "description": "Common JSON-schema definitions.",
  "definitions": {
    "created_at": {
      "description": "Creation date-time.",
      "example": "2018-01-01T01:01:01.001Z",
      "format": "date-time",
      "readOnly": true,
      "type": "string"
    },
  }
}

// src/services/comment/comment.validate.js will be generated with
const base = merge({},
  {
    properties: {
      createdAt: {
        description: "Creation date-time.",
        example: "2018-01-01T01:01:01.001Z",
        format: "date-time",
        readOnly: true,
        type: "string"
      }
    }
  },
);

// src/services/comment/comment.mongoose.js will be generated with
{
  createdAt: String
},
```

The definition of `createdAt` in common.json will be merged into the field in comment.schema.js.

You can create a $ref file like common.json with all the common elements in your app.
Should the need arise to change some, such as increasing the length of the `address` field,
you need change it in only one place, and then regenerate the project.

You can read about additional features of $ref in the
[JSON-schema tutorial](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-2--cms-25640).

## GraphQL

### Generated queries

GraphQL, in our opinion, is great for queries.
However we feel Feathers is cleaner and easier for mutations and subscriptions.

Two GraphQL CRUD queries are generated for each service.
They would be `getComment` and `findComment` for the `comment` service.
- `getComment` requires the `key` parameter. The `params` one is optional.
- `findComment` would usually include a `query` parameter. The `params` one is optional.

You call the queries using `app.service('graphql').find({ query: { query: graphqlQueryStr } })`,
where `graphqlQueryStr` is a GraphQL query such as
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

:::tip
The `{ query: { query: graphalQueryStr } }` syntax is compatible with tools such as GraphiQL.
:::

`$` is a reserved character in GraphQL queries, and GraphQL is very picky about it.
So Feathers reserved words like $in, $sort, $skip, etc. cannot be used as is.
You can instead replace their `$` with a double underscore `__` and use
__in, __sort, __skip, etc. instead.
The generated resolver functions will convert **any** `__` to `$` before making the Feathers service call.

### Calls to Feathers services

:::tip
The following does not apply to BatchLoaders.
:::

The `key` argument is used for Feathers' `id`.

The `query` and `params` arguments are merged to form the Feathers `params` argument.

`graphql: [...]` is added to Feathers' `params` to indicate the service call is part of a GraphQL query.
The array contains the **resolver path** (explained below) which caused the resolver function to be called.

The returned result is Feathers compatible.
It will contain pagination information if the top level service is configured for pagination.

You will have to programmatically paginate services other than the top level one,
using __skip and __limit.

### Resolver paths

:::tip Practical Advice
You will only be using resolver paths if you have to prevent certain users from querying specific information in their queries.

It may be best to return to this section when you have some experience with generating GraphQL queries,
and need more detailed control.
:::

Let's use this as an example GraphQL query.
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

While GraphQL is processing the query,
our resolver functions can produce a **resolver path** to identify when and why they are being called.

In the above example, the findUser resolver function would produce a resolver path of
```json
[ 'findUser', '[User]!' ]
```

This 2-tuple means the resolver was called for the `findUser` GraphQL type,
and its expected to return a `[User]!` result.

:::tip Hooks
This resolver path is added to the Feathers call and its available to your hooks as `context.grapql`.
Your hooks can use it for authorization and for generally knowing what part of the GraphQL query is being handled.
:::

Let's say findUser returned with 4 records.
We have to populate the posts for each, and each of the 4 populates would call the `posts` resolver.
This would result in the posts service being called 4 times with the paths
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
Let's say the first user had 2 posts, the comments service would be called with the resolver paths
```json
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ]
```
and the other user records would have their own resultant paths.

In summary, these resolver paths would be provided
```json
[ 'findUser', '[User]!' ] // to user service
[ 'findUser', 0, 'User', 'posts', '[Post!]' ] // to posts service
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ] // comments
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ] // comments
[ 'findUser', 1, 'User', 'posts', '[Post!]' ] // to posts service
// ... to comments service
[ 'findUser', 2, 'User', 'posts', '[Post!]' ] // to posts service
// ... to comments service
[ 'findUser', 3, 'User', 'posts', '[Post!]' ] // to posts service
// ... to comments service
```

### Provide resolver path to service hooks

Feathers service hooks can reference `context.params.graphql`.
Your hooks can use it for authorization and for generally knowing what part of the GraphQL query is being handled.

### Authentication

If the GraphQL endpoint is generated as requiring authentication,
then its resulting `context.user`, `context.authenticated`
are passed along to the resolver calls.

:::tip
`context.provider` is always passed along.
:::

You may have other props passed along as well by customizing src/services/graphql/service.resolvers.js
and batchloader.resolvers.js.
For example
```js
// !<DEFAULT> code: extra_auth_props
const convertArgs = convertArgsToFeathers(['extraPropName1', 'extraPropName2']);
// !end
```

### Pagination

Pagination is respected for the top-level service in the Query.
It is ignored by default for services at a lower level in the query.

The maximum number of keys retrieved by a BatchLoader defaults to the pagination size,
and you can customize it.
```js
// !<DEFAULT> code: max-batch-size
let defaultPaginate = app.get('paginate');
let maxBatchSize = defaultPaginate && typeof defaultPaginate.max === 'number' ?
  defaultPaginate.max : undefined;
// !end
```


## GraphQL example

**@feathers-plus/cli-generator-example** contains a Feathers app created with cli-plus containing a GraphQL endpoint.

There are 10 versions of the app, each in its own folder
folder name | language | database | resolver functions
:-|:-|:-|:-|
js-nedb-services | JavaScript | NeDB | plain Feathers calls
js-nedb-batchloaders | JavaScript | NeDB | BatchLoader calls
js-sequelize-services | JavaScript | Sequelize + SQLite | plain Feathers calls
js-sequelize-batchloaders | JavaScript | Sequelize + SQLite | BatchLoader calls
js-sequelize-sql | JavaScript | Sequelize + SQLite | raw SQL statements
ts-nedb-services | TypeScript | NeDB | plain Feathers calls
ts-nedb-batchloaders | TypeScript | NeDB | BatchLoader calls
ts-sequelize-services | TypeScript | Sequelize + SQLite | plain Feathers calls
ts-sequelize-batchloaders | TypeScript | Sequelize + SQLite | BatchLoader calls
ts-sequelize-sql | TypeScript | Sequelize + SQLite | raw SQL statements

### Getting Started

1. Fork @feathers-plus/cli-generator-example.
2. Install your dependencies

    ```
    cd path/to/cli-generator-example/the-folder-name
    npm install
    ```

3. The app starts a server listening on port 3030.
Check that the-folder-name/public/serverUrl.js will point to this server.

4. Start your app

    ```
    npm start
    ```

The app will initialize the database
and then run a short async test to confirm the GraphQL endpoint is functioning correctly.

### Starting the client test harness

Point your browser at the server, e.g. `localhost:3030`, and you will see this test harness:

![test harness](../assets/test-harness.jpg)

The client will authenticate with the server before enabling the `Run query` button.

You can run any of the 10 provided queries.
The query appears in the editable window on top
and you can modify any of those queries before running them.

The result (or error message) appears in the bottom window after you click `Run query`.

The examples show that GraphQL keywords are allowed in some of the resolvers.
These keywords are similar to those used with FeathersJS services.
- key: The same as FeathersJS `id`, a numeric or string.
- query: The same as FeathersJS `params.query`.
- params: The same as FeathersJS `params`.

`$` is a reserved character in GraphQL, so Feathers props such as `$sort` and `$in`
would result in GraphQL errors.
You can instead use a double underscore (`__`) where ever you would use a `$` with FeathersJS. 

### Using Graphiql

[Graphiql](https://github.com/graphql/graphiql) works with the generated GraphQL endpoint.

### Database

These examples use either an NeDB or SQLite database, both of which reside in `./data`.
Both databases have the same structure:

![database stucture](../assets/schema.jpg)

and contain the same data:

![database data](../assets/tables.jpg)

`uuid` fields are used as foreign keys for table relations
so as to avoid differences between `id` and `_id` in different databases.

