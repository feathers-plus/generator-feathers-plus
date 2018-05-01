# Guide

[[toc]]

## Installation

`npm i -g @feathers-x/cli`

::: danger STOP
`generator-feathers-plus` is not automatically installed as a dependency
during the development period.

Do the following so that any change you make in @feathers-x/generator-feathers-plus
will be immediately reflected in @feathers-x/cli.

- Clone `@feathers-x/generator-feathers-plus`.
- [Symlink](https://medium.com/trisfera/the-magic-behind-npm-link-d94dcb3a81af)
it into @feathers-x/cli.
  - In @feathers-x/generator-feathers-plus, run `npm symlink`.
  - In @feathers-x/cli, run `npm symlink @feathers-x/generator-feathers-plus`.
  The location containing the global @feathers-x/cli will vary based on your OS.
  You can run `npm list -g` to see where global libraries are installed.
:::

## Introduction

The cli-plus is similar to @feathersjs/cli in that:
- It uses the same commends, e.g. `generate service`.
- It prompts with the same questions, e.g. "Which path should the service be registered on?"
- It generates the same modules with pretty much identical code.

However the similarities fundamentally end there.


## Regenerating apps

Cli-plus persists a definition of the app in `project-name/feathers-gen-specs.json`.
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

Cli-plus can therefore regenerate part of, or all of the app at any time.
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

@feathers-plus/cli comes with generators not in @feathersjs/cli.

### feathers-plus generate options

```text
The generator will not change the following modules in my-app
  public/favicon.ico, index.html
  src/
    hooks/logger.js
    middleware/ { all files other than index.js)
    refs/common.json
    services/serviceName/serviceName.class.js
    channels.js
  test
    services/*.test.js
    app.test.js
  tsconfig.json, tsconfig.test.json, tslint.json
  .editorconfig, .gitignore, LICENSE, README.md

You have additionally prevented the following modules from being changed.
You can modify this list by manually changing it in
my-app/feathers-gen-specs.json##options.freeze.
  - No files are frozen.

This project was generated using version 1.0.0 of the generator.

? Generate TypeScript code? No
? Use semicolons? Yes
? View module changes and control replacement (not recommended)? No
```

JavaScript or TypeScript are generated based on the first prompt.
The second prompt determines if statements are terminated by semicolons or not.
You can view the difference between a new module and its previous version with the third prompt.
This is a good way to understand what changes are being made.

The generator creates a few modules with default contents,
after which it will not change them.
This leaves you free to modify them as you wish.

You can optionally `freeze` additional modules by adding their paths to
`options.freeze` in `my-app/feathers-gen-specs.json`.
For example `src/services/comments/comments/validate.js`.
The generator will not change nor remove these.

:::tip
The generator defaults to JavaScript.
You should run `generate options` before `generate app` if you want to generate a TypeScript project.
:::

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

### feathers-plus generate all

This regenerates the entire project.
Its a good way to refresh your project with the latest generator templates and bug fixes.

### feathers-plus generate codelist

This lists all the custom code in the project.
This list, when combined with `feathers-gen-specs.json`, completely defines what the
generated modules do.

```text
The custom code found in generated modules in dir my-app:

> Module src/index.**
> Location imports
const initDb = require('../test-helpers/init-db');
const testGraphql = require('./test-graphql');
> Location listening_log
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
> Location end
setTimeout(() => { //
  initDb(app)
    .then(() => testGraphql(app))
    .catch(err => {
      console.log(err.message);
      console.log(err.stack);
    });
}, 1000);

> Module src/services/comments/comments.schema.**
> Location schema_definitions
  definitions: {
    id: {
      description: 'unique identifier',
      type: 'ID',
      minLength: 1,
      readOnly: true
    }
  },
> Location schema_required
    'uuid', 'authorUuid'
> Location schema_properties
    id: { $ref: '#/definitions/id' },
    _id: { type: 'ID', a: 1 },
    uuid: { type: 'integer' },
    authorUuid: { type: 'integer' },
    postUuid: { type: 'integer' },
    body: { $ref: 'body.json' },
    archived: { type: 'integer' }
```


## Retaining custom code

`@feathersjs/cli`'s job ends when it generates the app scaffolding.
It doesn't know what you do afterwards with it.

`@feathers-plus/cli` (also known as `cli-plus`)is a `round-trip` generator.
Round-trip generators can take previously generated code, identify custom changes made to it,
and regenerate the code (maybe using different responses to the prompts)
along with those custom changes.

Cli-plus completes the round trip: `generate -> customize -> regenerate -> customize => ...`.

The developer and cli-plus are in a more collaborative relationship.
They can work co-operatively on the scaffolding code.

### Retain developer modifications

You will usually add your own code to the generated modules.
Cli-plus can identify such additional code, as long as certain standards are followed,
and it will retain that added code when regenerating modules.

Some of the code generated by cli-plus is identified as default code which you may want to customize.
Any customized code replacing the default code is also retained when modules are regenerated.

Let's look at a trivial example of these features.
An 'identical' module `src/index.js` is created by both @feathersjs/cli and cli-plus when `generate app` is run.
The cli-plus module has some extra decorative comments:
```js
server.on('listening', () => {
  // !<DEFAULT> code: listening_log
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
  // !end
});

// !code: end // !end
```

Starting the server produces the expected log:
```text
Feathers application started on http://localhost:3030
```

The lines between `// !<DEFAULT> code: listening_log` and `// !end` contain default code named `listening_log`.
The `// !code: end // !end` line identifies a location named `end` where additional lines may be added.

Let's change the code to:
```js
server.on('listening', () => {
  // !code: listening_log <-- Note that <DEFAULT> was removed.
  logger.info('Hello world on http://%s:%d', app.get('host'), port);
  // !end
});

// !code: end
logger.info('Initialization complete. Waiting for server to start.'); 
// !end
```

Starting the server now logs:
```text
Initialization complete. Waiting for server to start.
Hello world on http://localhost:3030
```

Let's say you originally ran `generate app` selecting only `socket.io` as a transport.
You then changed the code in `src/index.js` as described above.
Later on you realize you also need `REST` as a transport.
You can just rerun `generate app` with cli-plus and select both transports.
The regenerated modules will contain the code changes you made above.

### Where can code be added?

The short answer is "just about anywhere".
Insertion points are available anywhere it makes any sense to add code.

Here is a typical `src/services/index.js`:
```js
// Configure the Feathers services. (Can be re-generated.)
let comment = require('./comment/comment.service');
let like = require('./like/like.service');
let post = require('./post/post.service');
let relationship = require('./relationship/relationship.service');
let user = require('./user/user.service');

let graphql = require('./graphql/graphql.service');
// !code: imports // !end
// !code: init // !end

let moduleExports = function (app) { // eslint-disable-line no-unused-vars
  app.configure(comment);
  app.configure(like);
  app.configure(post);
  app.configure(relationship);
  app.configure(user);

  app.configure(graphql);
  // !code: func_return // !end
};

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
```

All the modules follow the same standards, e.g. starting with `imports` and `init`,
and ending with `funcs` and `end`.
Functions tend to end with names like `func_return` so you can add code to them.
You can replace or mutate the required modules at `init` as well as adding any initialization code.
You can modify or replace the exported value at `exports`.

Its trivial to add insertion points into the generator, so create an issue if you need additional ones.
We'll add that insertion point, and you just regenerate the app to be able to use it.


### More realistic code customization

The previous example gets the idea across but its too trivial to appreciate the impact of the feature.

Cli-plus generates a module for every service named `src/services/serviceName/serviceName.validate.js`.
It contains JSON-schema which may be used to validate record contents before create, update and patch calls.
Part of the code may be similar to:
```js
const base = merge({},
  // !<DEFAULT> code: base
  {
    $schema: "http://json-schema.org/draft-05/schema",
    title: "User",
    description: "User database.",
    required: [
      "uuid",
      "email",
      "firstName",
      "lastName"
    ],
    properties: {
      _id: {
        type: ID
      },
      uuid: {
        type: ID
      },
      email: {
        type: "string"
      },
      firstName: {
        type: "string", maxLength: 30,
      },
      lastName: {
        type: "string", maxLength: 30,
      }
    }
  },
  // !end
  // !code: base_more // !end
);
```

This 'base' JSON-schema is derived from the `service model`
-- A new concept cli-plus introduces further explained below --
and it is the basis for the validation schemas used for the different types of calls.

The developer may replace the default code named `base` to suit his use case.

It would probably be better however to mutate the default schema by adding, mutation or removing
properties by adding custom code to `base_more`, e.g.:
```js
// !code: base_more
{
  properties: {
    firstName: { minLength: 45 },
    initial: { type: 'string', maxLength: 1 }
  }
}
// !end
```
This would be better because, now, when you change the `service model`,
cli-plus will make appropriate changes to the base schema in its default code.
This is better than remembering to modify the base schema manually every time you change the service model.

### GraphQL examples

One of the main features of cli-plus is its ability to generate a GraphQL endpoint as well as the necessary resolvers.
A large number of carefully coded resolvers need to defined in a reasonably sized project,
so automatically generating these resolvers is a quality-of-life feature.

However resolvers often have to be customized in unexpected ways.
You may need to change the sort order.
You may need to set props in `context.params` for certain hooks.
There is no practical end to the customizations required.

Here are some code snippets in src/services/graphql/service.resolvers.js
which cli-plus may generate for a GraphQL endpoint:
```js
    // Feathers service resolvers
    User: {

      // comments: [Comment!]
      comments:
        // !<DEFAULT> code: resolver-User-comments
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { authorUuid: parent.uuid, $sort: undefined }, paginate: false
          });
          return comments.find(feathersParams).then(extractAllItems);
        },
        // !end

      // fullName: String!
      fullName:
        // !<DEFAULT> code: resolver-User-fullName-non
        (parent, args, content, ast) => { throw Error('GraphQL fieldName User.fullname is not calculated.'); },
        // !end

      // posts(query: JSON, params: JSON, key: JSON): [Post!]
      posts:
        // !<DEFAULT> code: resolver-User-posts
        (parent, args, content, ast) => {
          const feathersParams = convertArgs(args, content, ast, {
            query: { authorUuid: parent.uuid, $sort: undefined }, paginate: false
          });
          return posts.find(feathersParams).then(extractAllItems);
        },
        // !end
    },
```
You can customize them as you wish, by defining a `$sort` order for example.

`fullname` is a calculated field.
Cli-plus, rather than inventing some specialized way for you to indicate what the calculation is,
just creates some default code for you to replace with the calculation.
For example
```js
      // fullName: String!
      fullName:
        // !code: resolver-User-fullName-non
        (parent, args, content, ast) => `${parent.firstName} ${parent.lastName}`,
        // !end
```

### Avoiding customization

@feathersjs/cli generates a module and doesn't care what you do thereafter.
You can have cli-plus generate modules and then prevent it from making changes therafter to some of them,
by using the `options.freeze` prop in `feathers-gen-specs.json`.

### Some details

The leaders for custom code may be : `// !code:`, `// !<> code:`, `//!code:`, or `// ! code:`.

The trailers may be: `// !end`, or `//!end`


## Feathers Service Models

Most database systems use a [schema](https://en.wikipedia.org/wiki/Database_schema)
to describe how the data in a database table or collection is organized,
as well as how the different schemas relate to one another.
Unfortunately, schemas are normally not shareable between different databases.
The Mongoose database adapter, for example, will not understand a schema
written for the Sequelize database adapter.

However if you use Feathers Service Models,
@feathers-plus/cli can automatically convert your Feathers model into the schema expected by
a particular database adapter.

With Feathers service adapters and Feathers Models you can connect to the most popular databases and
query them with a unified interface no matter which one you use.
This makes it easy to swap databases and use entirely different DBs in the same app
without changing your application code.

### JSON-schema

Feathers Models are based on [JSON-schema](http://json-schema.org/).
JSON-schema is the most popular way to describe the structure of
[JSON](https://en.wikipedia.org/wiki/JSON)
data and, since JSON data is essentially just plain old JavaScript objects,
this makes JSON-schema a great fit for Feathers Models.

JSON-schema:

- has the widest adoption among all standards for JSON validation.
- is very mature (current version is 6).
- covers a big part of validation scenarios.
- uses easy-to-parse JSON documents for schemas.
- is platform independent.
- is easily extensible.
- has 30+ validators for different languages, including 10+ for JavaScript,
so no need to code validators yourself.

The [`validateSchema`](https://feathers-plus.github.io/v1/feathers-hooks-common/index.html#validateSchema)
common hook already uses JSON-data for verification.

### Swagger and OpenAPI

Swagger and OpenAPI are 2 more reasons to use JSON-schema.

[Swagger](https://swagger.io/)
is a popular tool which allows you to describe the structure of your APIs
so that machines can read them.

Swagger uses a *subset* of JSON-schema to describe its data formats.

:::tip
You can use `feathers-swagger` to expose your Swagger definitions.
:::

The recent [OpenAPI Initiative](https://www.openapis.org/blog/2017/07/26/the-oai-announces-the-openapi-specification-3-0-0#)
(OAI), a Linux Foundation project created to advance API technology,
provides a foundation for developing interoperability of APIs and other technologies.
Its members include Adobe, Google, IBM, Microsoft, Oracle, PayPal, RedHat and Salesforce.

OAI v2 was essentially Swagger.
The v3 release is the culmination of nearly two years of collaboration among senior API developers
and architects from across multiple industries, such as payment and banking, cloud computing,
the Internet of Things, and vendors building API solutions.

OAI's data formats use JSON-schema.


### Easy to get started

JSON-schema is easy to write, and there are some great
[tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343).

Thankfully, you don't have to learn how to write JSON-schema before you can start writing your app.
There is wide support for JSON-schema online, including utilities which you can leverage to write your Feathers Models.

You can
- Generate a Feathers Model online by pasting a JavaScript object.
- Generate Feathers Models by providing a utility the contents of your database.
- Generate Feathers Models from
[Mongoose](http://mongoosejs.com/docs/schematypes.html) schemas or
[Sequelize](http://docs.sequelizejs.com/class/lib/model.js~Model.html) models.
- Generate Feathers Models from Walmart's [Joi](https://github.com/hapijs/joi)
object validation schemas.

Finally, you can test your JSON-schema by running a utility against your existing data.

### More generated code

Cli-plus will write useful modules when you provide a model for a Feathers service.
These include:
- Schemas to valid your data for create, update and patch service calls. (available)
- A GraphQL endpoint. (available).
- Schemas for fastJoin to populate your data on the server. (TBA)
- Generate test data. (TBA)
- Help generating the UI for
  - [React forms](https://github.com/mozilla-services/react-jsonschema-form).
  - [React with redux-form](https://limenius.github.io/liform-react/#/).
  - Vue.


## Writing JSON-schema

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

Feathers Models can default the `type` properties, so you can write more concisely:
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
uses `ajv` to validate data.
:::

:::tip
We are not certifying the utilities and websites mentioned below work flawlessly.
They are part of the JSON-schema ecosystem and may prove useful.
We welcome your feedback on them.
:::

### Exploring JSON-schema

You can also convert a JSON object to JSON-schema online at
[https://jsonschema.net](https://jsonschema.net).
This provides an interesting way to explore JSON-schema.

![initial online page](../assets/online-1.jpg)

The first thing to do is change `ID Type` from `Relative` to `None`,
followed by clicking `Generate Schema`.

![standard online page](../assets/online-2.jpg)

The `type` of each JSON data property is specified in the JSON-schema.
The `tags` array is typed as an `array` with its `items`, i.e. elements, typed as `string`.

You can play around with the input JSON, seeing how your changes affect the JSON-schema.

### Exploring global options

You can control options for the conversion in the area below `Generate Schema`.
Enable `Number Options` and check `Use number, not integer`.

![Number options](../assets/online-3a.jpg)

Followed by clicking `Generate Schema`.

![Number Options page](../assets/online-3b.jpg)

You can see that `"type": "number"` is now used for all numeric values.

:::tip
Feathers Models should use `"type": "number"`.
:::

Now check the `Metadata` and `Show default attributes` boxes in `Global Options`,
followed by clicking `Generate Schema`.

![Global Options page](../assets/online-4.jpg)

You can see how the JSON-schema grows in sophistication.

### Exploring field options

Refresh the page to get the original `https://jsonschema.net/#/editor` page.

Once again change `ID Type` from `Relative` to `None`,
followed by clicking `Generate Schema`.
This let's us back to our starting point.

![standard online page](../assets/online-2.jpg)

Click the `Edit` icon to see options for each field in the JSON-schema.

![field 1 page](../assets/online-5a.jpg)

In the `@optional tags <array>` panel, click the down arrow in the inner `@optional <string>` panel
to see all the options for the array `tags`.

![field 2 page](../assets/online-5b.jpg)

- `Min items` to 1.
- `Max items` to 4.
- `Minimum length` to 2.
- `Maximum length` to 16 and **press the `tab` key to properly exit this input field.**

![field 3 page](../assets/online-5c.jpg)

- Click the diskette/drive icon in the `@optional tags <array>` panel to save your changes.
- **Do not** click `Generate Schema`.
- Click the `Pretty` button at the top of the page.

![field 4 page](../assets/online-5d.jpg)

You can see that validation rules have been added to the `tags` entry in the JSON-schema.

### Using existing data collections

Some records in a collection many differ from other records.
In one record a field may have a numeric value, while in another it may be `null`.
Some records may have fields which others do not.

Utilities exist to scan all the records in your collection
and produce a consolidated JSON-schema.
You may find these useful in some situations.

Here are two of them.

#### [generate-schema](https://github.com/nijikokun/generate-schema)

![generate-schema 1](../assets/generate-schema-1.jpg)

![generate-schema 2](../assets/generate-schema-2.jpg)

#### [json-schema-generator](https://github.com/krg7880/json-schema-generator)

![json-schema-generator 1](../assets/json-schema-generator-1.jpg)

![json-schema-generator 2](../assets/json-schema-generator-2.jpg)

### Using existing database schemas

If you have existing schemas
and you'd like to take advantage of the new features of Feathers Models,
there are utilities that will convert them into JSON-Schemas:

[`mongoose-schema-jsonschema`](https://github.com/DScheglov/mongoose-schema-jsonschema)
and [`mongoose-jsonschema`](https://www.npmjs.com/package/mongoose-jsonschema)
convert Mongoose schema to JSON-schema.

There are
[several utilities available](https://www.google.com/search?q=sequelize+to+json+schema&oq=sequelize+to+json+schema&aqs=chrome..69i57j0j69i60.5582j0j4&sourceid=chrome&ie=UTF-8)
available to convert Sequelize models.

Search for utilities for other databases.

### Verifying against JSON

Once you have your JSON-schema, you can check it acts as expected
by having it verify JSON which you know is valid by, for example,
using the [online JSON Schema Lint](https://jsonschemalint.com)
site.

Click the `Samples dropdown and choose `Sample draft-06 schema and valid document`.

![lint json 2](../assets/lint-online-2.jpg)

Or `Sample draft-06 schema and **invalid** document`.

![lint json 3](../assets/lint-online-3.jpg)

:::tip
You may have extracted your JSON from someplace and its hard to read.
You have a long JSON which is invalid --- someplace.
You may find [JSONLint](https://jsonlint.com/) useful to prettify and debug your JSON.
:::

### Linting you JSON-schema

How do you check your JSON-schema is valid?
Well every JSON-schema is itself a JSON object
and the official standards [JSON-schema org](http://json-schema.org/)
has meta-schemas which specify what JSON-schema should look like.

So you can download the [Meta-schemas](http://json-schema.org/documentation.html)
and use them to verify your JSON-schema, exactly the same way you'd use JSON-schema to verify JSON.

### Verifying against data collections

You can verify the compatibility of your JSON-schema and your data collection
by using the JSON-schema to verify your collection.

You can use the Feathers common hook
[`validateSchema`](../../api/hooks-common#validate-schema.md).
Or you may decide its more convenient to call
[`ajv`](https://github.com/epoberezkin/ajv)
directly.

### Verification in tests and build chains

You might some other ajv-based utilities useful.

[`grunt-jsonschema-ajv`](https://github.com/SignpostMarv/grunt-jsonschema-ajv)
is a [Grunt](https://en.wikipedia.org/wiki/Grunt_(software))
plugin for validating files against JSON Schema with ajv.

[`chai-ajv-json-schema`](https://github.com/peon374/chai-ajv-json-schema/blob/master/index.js)
purports to verify data using the `expect` syntax.

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


### Summary

The [online JSON-schema editor](https://jsonschema.net)
provides an easy introduction to JSON-schema,
as well as a useful generator of simple JSON-schema.

You will have to read the
[tutorial](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
sooner or later to understand how to add validation criteria.

There are also ways to generate your JSON-schema from your data,
and from existing database schemas.

Finally you can decide to check your JSON-schema against your existing data.


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
It defaults to the singular name you provided for the service, with the first letter capitalized.
- `service` - This is required if you want to generate GraphQL resolvers using Feathers service,
alone or with BatchLoaders.
  - `sort` - The sort criteria used when this service is the top level of a GraphQL Query.
- `sql` - This is required if you want to generate GraphQL resolvers which use raw SQL statements.
  - `sqlTable`: The name of the SQL table in the database.
  - `uniqueKey`: The name of the column containing the unique key for records in the table.
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
  It defaults to using a Sequelize instance.

You are asked which type of resolvers you want to use when generating the endpoint.
You can choose any for which your schemas have the required information.
You can change the the resolvers used by regenerating the endpoint.

### Generated queries

GraphQL, in our opinion, is great for queries.
However we feel Feathers is cleaner and easier for mutations and subscriptions.

Two GraphQL CRUD queries are generated for each service.
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

:::tip
The `{ query: { query: graphalQueryStr } }` syntax is compatible with tools such as GraphiQL.
:::

`$` is a reserved character in GraphQL.
So Feathers reserved words like $in, $sort, $skip, etc. cannot be used.
You can instead replace the `$` with a double underscore `__` and use
__in, __sort, __skip, etc. instead.

### Calls to Feathers services

:::tip
The following does not apply to BatchLoaders.
:::

The `key` argument is used for Feathers' `id`.

The `query` and `params` arguments are merged for the Feathers `params` argument.
`graphql: <Array>` is added to `params` to indicate the service call is part of a GraphQL query.
Its contents are described in the following section.

The returned result is Feathers compatible.
It will contain pagination information if the top level service is configured for pagination.

You will have to programmatically paginate services other than the top level one,
using __skip and __limit.

### Resolver paths

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

### Provide resolver path to service hooks

Feathers service hooks can reference `context.params.graphql = resolverPath }`
so that the hook has more information about the GraphQL call.

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

:::tip
@feathers-plus/cli-generator-example: Example Feathers app using the @feathers-plus/cli generator and the @feathers-plus/graphql adapter to expose a GraphQL endpoint.
:::

### Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/cli-generator-example
    npm install
    ```

3. `cli-generator-example` starts a server listening to port 3030.
Check that public/serverUrl.js will point to this server.

4. Start your app

    ```
    npm start
    ```

The app will create the database
and then run a short async test to confirm it is functioning correctly.

### Starting the client test harness

Point your browser at `localhost:3030` and you will see this test harness:

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

To do. Basically Graphiql will just work.

### Database

This app can use either an NeDB or SQLite database, both of which reside in `./data`.

Both databases have the same structure:

![database stucture](../assets/schema.jpg)

and contain the same data:

![database data](../assets/tables.jpg)

`uuid` fields are used as foreign keys for table relations
so as to avoid differences between `id` and `_id` in different databases.

### What type of resolvers are being used?

The repo on Github is (usually) configured to use Feathers service calls alone.
You can reconfigure it to use either Feathers service calls with
[BatchLoaders](https://feathers-plus.github.io/v1/batch-loader/guide.html)
or with raw SQL statements by running @feathers-plus/cli's `generate graphql` command.

Switching the resolvers being used like this is an interesting example of
the advantages of round-trip regeneration.
