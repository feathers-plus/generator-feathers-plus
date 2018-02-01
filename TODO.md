- optionally backup files being changed. folder name is Date.now(). feathers-gen-config.json ??
- what to do with json (merge?) and text files?
- let users have override template files.


- resolvers generate fastJoin and GraphQL interfaces
- signature of fastJoin has to change to be compatible with GraphQL. !!!!!

- swagger validation https://gist.github.com/Brian-McBride/04f03e72842b90a7b1afae16a4f34c99

- sequelize https://github.com/chaliy/sequelize-json-schema

TODO:

OK - app test doesn't run
OK - service test not created
OK - connection string prompted for again when nedb service is regenerated
OK - test src !== 'src'
OK - don't write specs expanded to file
OK - put in lib/generator.js generator.conflicter.force = true;
OK - publish feathers-plus/graphql
OK - enable in graphql/index.js // '@feathers-plus/graphql'
OK - get 'npm start' working for graphql
OK - updateSpecs likely no longer needs to update 'specs' param
OK - call specsExpand from specs.js
OK - check if nedb-1.validate.js does not create props at code: base when service is first created
OK - "shows a 404 JSON error without stack trace" shows a stack trace.
OK - move this.refreshCodeFragments to lib/generator.js & only run once for composedWith
OK - GraphQL extensions.graphql.name & .sqlTable should not be kebab case
OK - src/services/name/name.validate.js the service name in //Defines should not be kebab case
OK - do not update secret in default.json
OK - read config/default.json at start of writing() so as not to lose double updates to it.
OK - Redo app, service and graphql hook templates.
OK - generate graphql has linting issues
OK - eliminate config/default.js and option in specs.
OK - move things like deepMerge into the default context
OK - is context.requiresAuth needed in writing#app?
OK - service generator, this looks wrong. (Also check graphql)
OK   const auth = generator.props.authentication ? '.auth' : '';
OK - add new/old headings to generators
OK - generate authentication does not seem to default to data in specs.
OK - nedb-1.validate.js creates empty 'base' when a service without a schema is regenerated.
OK - name.validate.js does not include the following when a service is first created, but does when its recreated without change
OK   $schema: "http://json-schema.org/draft-05/schema",
OK   title: "Nedb1",
OK   description: "Nedb1 database.",
OK - remove configJs: false
OK - check all // todo
OK - look at how dependencies are done in writing() generators
OK - lib/generator.js#checkDirContainsApp() should check existance of feathers-gen-specs.json not package.json internals
OK -  generators to call checkDirContainsApp() consistently.
OK - Add the generator vers creating the app.
OK - why does mapping.feathers have all services not just those for GraphQL?
OK - Implement https://mail.google.com/mail/u/0/#inbox/16074e58e85beea7
OK - Look into https://mail.google.com/mail/u/0/#inbox/16074e913372c0c8
OK - testing generator app, feathers-gen-specs.json must ve
OK   "name": "z-1",
OK   "description": "Project z-1",
OK   and prompt must be "z-1" as "z1" does not work WHY NOT?
OK - when adding generate authentication, Local is not the default
OK   also the service generation part asks for the service name again
OK - generate service ()after generate authentication) does not ask if service s/b authenticated.
OK - middleware/index.js: user should change order, need comments saying what should be there e.g. name:path
OK - implement generator tests: feathersjs/generators-feathers/test/generators.test.js
OK - move defaultConfig into specs so we don't have to keep reading it for the latest updates 
OK - pass name as param to writing#service rather than thru generator.props.name
OK - check all prompting that they refer to specs, not to this.props 
OK - add freeze and inspectConflicts options
OK - remove inspector functions
OK - remove tracing
OK - review which modules are regenerated and which are written just once.
OK - finalize src.channels.ejs
OK - create mongodb $jsonSchema model
OK - First field in schema does not default to type: string
OK - track David PRs 330, 331 (no-op), 332, 333, 334 (no-op) plus our own esline-disable-next-line
OK - update README install: fork @feathers-x/generator-feathers-plus & syslink into @feathers-x/cli
OK - update README: when attr are allowed for resolvers in schema
OK - update README: about pagination. top level like Feathers. Lower levels control programatically with __skip and __limit
OK - update README: remind people to change cli-generator-example/public/serverUrl.js
OK - update README: doc $ref
OK - Convert completely to BatchLoader
OK - Add "Your hooks should contain ..." to app, service and graphql hooks.ejs

NO - hooks modules should be ifNew: true
NO - should class.js and class-async.js be in their own folder?
NO - lib/generator.js defaultConfig needs to change if config/default.js is to be used
NO - add initial/updating for connections
NO - in graphql, feathers-batch-loader.js#serializeRecordKey & serializeDataLoaderKey should use
NO   feathers-plus-common/object/sortKeys if param is object to organize props in order
NO   else the two won't be considered "equal".
NO   --> Let user handle this as we think object keys will be rarely used. 

LATER - findUser & findPost produce with batchloader "null" found at char 681 near: "followed_by": null, "followi
LATER   graphql/lib/run-time/feathers/extract-items.js#extractAllItems : return [] instead of null x2.

- Add deepmerge as a dependency on 'generate service'
- mongodb requires `new ObjectID(foreign_key)`
- cannot deepmerge mongo BSON instances

- batchloaders need context.params.paginate = false
- batchloaders meed maximum loads & set equal to default.json#pagination.max
- add to batchloader docs that pagination affects $in, so pagination=false needed.
- batchloaders return null rather than []


- why are there blank lines on loading deps between 'skip' and 'force' ?
- check @f+/graphql is installed on `generate graphql`
  There may be problems finding graphql/graphql in cli-generator-example

- GraphQL pagination. (a) in-record fields (b) {total, skip, limit, data} (c) separate pagination object.
  Maybe specify which resolvers we want to support pagination.
- should paginate values in default.json be app level options?
- Why is startup so slow? Are we scanning node_modules?
- add option for semicolons or not
- create Sequelize schema
- create fastJoin definitions
- create for swagger

Upgraded generated BatchLoader resolvers for pagination.

- @f+/graphql@1.5.0 is the required dependency for generated apps.
  This should be installed when a *new* app is generated.
  PLEASE INFORM IF ITS UPDATED automatically on `generate graphql`.
  (Not that there's much we can do about it.) 
- graphql/graphql remains a package.json dependency of @f+/graphql
- In batchloaders.resolvers.js, the BatchLoader func will be called with
  no more than `maxBatchSize` keys. maxBatchSize defaults to
  default.json#paginate.max.
- maxBatchSize can be customized. undefined or Infinity will call with all
  keys, as it did previously.
- `paginate: false` is the default for BatchLoaders, so maxBatchSize
  controls the pagination.
- BatchLoaders now return `[]` instead of `null` for an array of results
  containing no records.