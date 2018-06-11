# Maintainers

<collapse-image hidden title="Folders After 'generate options'" url="/assets/get-started/generate-options-dir.png" />


## Tests

The contents of folders with names like app.test-copied are initially copied to the test dir
before a test is started.
They always contain feathers-gen-specs.json and may contain service models in files like src/services/nedb-1/nedb-1.schema.js

- `npm run mocha:code` will compare the source produced by the tests to what it should be.
Its fast because it does not install the dependencies.
- `npm run mocha:tests` will run `npm test` for each generated test app.
Its very slow as it has to install dependencies for each test.
- `npm test` runs both of the above.

The tests stop running on the first assertion failure.

## Database Maintainers

This information is intended to help new maintainers, responsible for specific databases, get up to speed.

### Structure of the generator

This generator is build with [yeoman](http://yeoman.io/).
Its tests use [yeoman-test](https://github.com/yeoman/yeoman-test).

The generator is installed with `npm install --global @feathers-plus/cli`.
Than notably installs the @feathers-plus/graphql adapter as a dependency.

It also installs @feathers-plus/generator-feathers-plus which contains the actual yeoman generators,
which reside in `generator-feathers-plus/generators`.
`feathers-plus generate service`, for example, will run the generator in `generator-feathers-plus/generators/service`.

BTW this service generator will internally call the connection generator.
The authentication generator similarly calls the service generator (which then calls the connection one).

Usually a normal yeoman generator stands alone.
It gets responses to its prompts and it generates its own code without reference to other generators.

Our generators are inter-related, they share code, and we want to regenerate the entire app.
Therefore our generators only obtain responses to their prompts
and then call generators/writing/index.js.

generators/writing is not a yeoman generator.
It takes the then current app specs (persisted in `project-name/feathers-gen-specs.json`),
plus the name of the generator being run, and it generates the required modules.

### Building database schemas
 
The modules for services are written in `function service (generator, name)`.
`name` is the name of the service, e.g. 'user1'.
The function's closure notably contains:

- `specs`: the current app specs, expanded. The unexpanded specs are persisted in `project-name/feathers-gen-specs.json`.
These specs may only be mutated by calling lib/specs.js.
```text
{ options: { ver: '1.0.0', inspectConflicts: false, freeze: [] },
  app: 
   { name: 'z-1',
     description: 'Project z-1',
     src: 'src1',
     packager: 'npm@>= 3.0.0',
     providers: [ 'socketio' ] },
  services: 
   { nedb1: 
      { name: 'nedb1',
        fileName: 'nedb-1',
        adapter: 'nedb',
        path: '/nedb-1',
        isAuthEntity: false,
        requiresAuth: false,
        graphql: true },
     nedb2: 
      { name: 'nedb2',
        fileName: 'nedb-2',
        adapter: 'nedb',
        path: '/nedb-2',
        isAuthEntity: false,
        requiresAuth: false,
        graphql: true } },
  connections: 
   { 'nedb+nedb': 
      { database: 'nedb',
        adapter: 'nedb',
        connectionString: '../data' } },
  graphql: 
   { name: 'graphql',
     path: '/graphql',
     strategy: 'services',
     requiresAuth: false },
  _databases: { nedb: '../data' },
  _adapters: {},
  _dbConfigs: { nedb: '../data' },
  _connectionDeps: [ 'nedb' ],
  _generators: [ 'all' ],
  _defaultJson: 
   { host: 'localhost',
     port: 3030,
     public: '../public/',
     paginate: { default: 10, max: 50 } },
  _isRunningTests: true }
```
The props whose names begin with an underscore are not persisted in feathers-gen-specs.json.

- `mapping`: A list of Feathers services plus mappings to GraphQL schemas.
It is built in lib/service-specs-expand.js.
```text
{ feathers: 
   { nedb1: { graphql: 'Nedb1', path: '/nedb-1' },
     nedb2: { graphql: 'Nedb2', path: '/nedb-2' } },
  graphqlService: 
   { Nedb1: { service: 'nedb1', path: '/nedb-1' },
     Nedb2: { service: 'nedb2', path: '/nedb-2' } },
  graphqlSql: {} }
```

- `feathersSpecs[name]`: The expanded definition for the service.
It is also built in lib/service-specs-expand.js.
```text
{ '$schema': 'http://json-schema.org/draft-05/schema',
  title: 'Nedb2',
  description: 'Nedb2 database.',
  required: [],
  properties: 
   { id: { type: 'ID' },
     _id: { type: 'ID' },
     nedb1Id: { type: 'ID' } },
  _extensions: 
   { graphql: 
      { name: 'Nedb2',
        service: { _id: 1 },
        discard: [],
        add: 
         { nedb1: 
            { type: 'Nedb1!',
              args: '',
              relation: 
               { ourTable: 'nedb1Id',
                 otherTable: '_id',
                 ourTableIsArray: false,
                 ourTableSql: 'nedb1Id',
                 otherTableSql: '_id' },
              typeName: 'Nedb1',
              isScalar: false,
              isNullable: false,
              isArray: false,
              isNullableElem: null,
              serviceName: 'nedb1' } },
        sql: { uniqueKey: 'id', sqlColumn: {} },
        serviceSortParams: ', { query: { $sort: {   _id: 1 } } }' } } }
```

- `context`: What is passed to the templates.
```text
{
    specs,
    feathersSpecs,
    mapping,
    hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; },
    sc: specs.options.semicolons ? ';' : '',

    merge, // require('lodash.merge')
    EOL, // require('os').EOL
    stringifyPlus, // require('./lib/stringify-plus)
    
    serviceName: name,
    kebabName,
    adapter,
    path: stripSlashes(path),
    authentication: isAuthEntityWithAuthentication,
    isAuthEntityWithAuthentication,
    requiresAuth: specsService.requiresAuth,
    
    libDirectory: specs.app.src,
    modelName: hasModel ? `${kebabName}.model` : null,
    serviceModule,
    
    mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
    mongooseSchemaStr: stringifyPlus(context.mongooseSchema, { nativeFuncs }),
    // models for other databases should be added here
  }
```

- `mongooseSchema`: The model for mongoose.
Its built in lib/service-specs-to-mongoose.js.
Models for other databases should be similarly built.

### Templates

The code templates are in `generators/writing/templates` and they are organized just as in a generated app.
They are mostly [ejs](http://ejs.co/) templates, along with some plain .js and .json.
The templates for database model schemas are in `templates/src/services/name/name.<database name>.ejs`.

A template is scheduled for building by adding an entry to `todos` in the function services:
```js
    // src:    Location of template.
    // dest:   Destinate of generated module.
    // ifNew:  Generate module only if it doesn't already exist.
    // ifSkip: If this generation should be skipped.
    // ctx:    Additional context to pass to template.
    function tmpl (src, dest, ifNew, ifSkip, ctx) {
      return { type: 'tpl', src, dest, ifNew, ifSkip, ctx };
    }
// ...
    todos = [
      tmpl([testPath,   'services', 'name.test.ejs'], [testDir, 'services', `${kn}.test.js`],        true                        ),
      tmpl([serPath,    '_model', modelTpl],          [libDir, 'models', `${context.modelName}.js`], true, !context.modelName    ),
      tmpl(mainFileTpl,                               [libDir, 'services', kn, `${kn}.service.js`],  true                        ),
      tmpl([namePath,   genericFileTpl],              [libDir, 'services', kn, `${kn}.class.js`],    true, adapter !== 'generic' ),

      tmpl([namePath,   'name.schema.ejs'],           [libDir, 'services', kn, `${kn}.schema.js`]    ),
      tmpl([namePath,   'name.mongoose.ejs'],         [libDir, 'services', kn, `${kn}.mongoose.js`]  ), // mongoose is here
      tmpl([namePath,   'name.validate.ejs'],         [libDir, 'services', kn, `${kn}.validate.js`]  ),
      tmpl([namePath,   'name.hooks.ejs'],            [libDir, 'services', kn, `${kn}.hooks.js`]     ),
      tmpl([serPath,    'index.ejs'],                 [libDir, 'services', 'index.js']               )
    ];
```

`todos` is processed by lib/generator-js.js.

### Adding a Schema for a Database

Models for a new database may be added to the generator as follows:

(1) Write a module to create the model, e.g. lib/service-specs-to-mongoose.js.

(2) If you do not have all the info you need, modify lib/service-specs-expand.js.

(3) Add the generated model to `context`.

```js
mongooseSchema:
  serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
```

(4) Convert it into a "neat" string.

```js
mongooseSchemaStr:
  stringifyPlus(context.mongooseSchema, { nativeFuncs }),
```

(5) Add a template named generators/writing/templates/src/services/name/name.database-name.ejs.

(6) Schedule it for building in `todos`.

```js
tmpl([namePath, 'name.mongoose.ejs'], [libDir, 'services', kn, `${kn}.mongoose.js`]  ),
```

(7) Add the resulting generated modules to the tests in the test/test-name.test-expected folders.


## GraphQL Pagination Proposal

:::tip
Proposal to support pagination for interior joins
:::

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

### Provide resolver path to service hooks

Feathers service hooks presently see `{ graphql: true }`
and so only know that the call is part of a GraphQL call.
This call be changed to `{ graphql: resolverPath }` so that the hook has more information
about the GraphQL call.

### Return resolver pagination information

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

:::warning
Perhaps this is not the best design as it requires searching the array for desired population info.
A hash may be better where the prop is the serialized resolver route ?!?
:::

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

:::danger stop
BatchLoaders cannot return such information.
In fact, **I'm not sure BatchLoaders** can support pagination without extreme contortion.
:::

:::danger stop
WHAT IS THE POINT OF THIS?
Will an app actually rerun the **WHOLE** Query must to scroll on an inner paginated record?
Would it need another Query just to scroll those records and any joined records?
:::

:::danger stop
We cannot implement pagaination UNTIL WE HAVE AN ANSWER FOR THIS.
:::
