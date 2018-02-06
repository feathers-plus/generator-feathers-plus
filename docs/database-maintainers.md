
## Database Maintainers

This information is intended to help new maintainers, responsible for specific databases, get up to speed.

### Structure of the generator

This generator is build with [yeoman](http://yeoman.io/).
Its tests use [yeoman-test](https://github.com/yeoman/yeoman-test).

The generator is installed with `npm install --global @feathers-x/cli`.
Than notably installs the @feathers-plus/graphql adapter as a dependency.

It also installs @feathers-x/generator-feathers-plus which contains the actual yeoman generators,
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
    semicolon: specs.options.semicolon ? ';' : '',

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

- Write a module to create the model, e.g. lib/service-specs-to-mongoose.js.
- If you do not have all the info you need, modify lib/service-specs-expand.js.
- Add the generated model to `context`.
```js
mongooseSchema: serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions),
```
- Convert it into a "neat" string.
```js
mongooseSchemaStr: stringifyPlus(context.mongooseSchema, { nativeFuncs }),
```
- Add a template named generators/writing/templates/src/services/name/name.<database name>.ejs.
- Schedule it for building in `todos`.
```js
tmpl([namePath,   'name.mongoose.ejs'],         [libDir, 'services', kn, `${kn}.mongoose.js`]  ),
```
- Add the resulting generated modules to the tests in the test/<test name>.test-expected folders.

### MongoDB

- 