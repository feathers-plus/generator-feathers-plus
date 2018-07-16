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
OK - batchloaders need context.params.paginate = false
OK - batchloaders meed maximum loads & set equal to default.json#pagination.max
OK - batchloaders return null rather than []
OK - mongodb requires `new ObjectID(foreign_key)`
OK - cannot deepmerge mongo BSON instances
OK - check @f+/graphql is installed on `generate graphql`
OK - There may be problems finding graphql/graphql in cli-generator-example
OK - GraphQL pagination. (a) in-record fields (b) {total, skip, limit, data} (c) separate pagination object.
OK   Maybe specify which resolvers we want to support pagination.
OK - should paginate values in default.json be app level options?
OK - add to batchloader docs that pagination affects $in, so pagination=false needed.
OK   Point out how batchloader can control max keys in a call.
OK - Added validationLevel & validationAction to mongodb name.services.js
OK - why are there blank lines on loading deps between 'skip' and 'force' ? generate service
OK   These were caused by the prompt modules for composeWith generators.
OK - generator-feathers-plus: Changed deepmerge to lodash.merge
OK - f+/graphql: Changed lodash.mergeWith to lodash.merge
OK - Add deepmerge as a dependency on 'generate service'
OK - do we switch to lodash.merge everywhere?
OK - Matt wrote: Just fwiw when I do an npm i it removed the git ref’d feathers-hooks-common
OK   The generator installs dependencies. It replaces your github one with the latest version on npm.
OK   On the `npm i` the package.json was probably already overridden.
OK - fixed bug that crashed `generate authentication`.
OK - fixed bug that crashed on `generate all` when `generate graphql` had not yet been run.
OK - fixed bug where user-entity lost its user-entity flag when it was regenerated.
OK - wrote cumulative test for @f/memory
OK - wrote cumulative test for @f/mongo
OK - wrote cumulative test for @f/mongoose
OK - Individual tests can now call the generator multiple times, changing the app specs each time.
OK - A `generate all` is run on each call, regenerating the app.
OK - A code compare is done on the final result, as well as `npm test` or `yarn test`
OK - We can now start adding regeneration tests to the test suite.
OK - Added a test to test this multi-call scaffolding.
OK - When `generate authentication` is being used to change the user-entity, a message is now
OK   displayed reminding people to `generate service` the old user-entity as hooks need to change.
OK - Added test to regen using `generate authentication` and create a new user-entity service,
OK   thus making the previous user-entity a normal service.
OK - add quickValidate(method, data, options) inside $name$.validate.js.
OK - remove $schema from name.validate.js and from name.mongo.js
OK - Adapters such as mongodb.js are generated and required by app.js. However if services are
OK   regenerated to use other adapters, these previously generated adapters may not longer still
OK   be used. Their generated modules, such as mongodb.js, can remain. However app.js
OK   should no longer require them.
OK - `generate app` creates a new default.json. It cannot do that on regens.
OK   Test regen-adapters-1.test-copy will need config/default.json with "mongodb": "mongodb://localhost:27017/z_1"
OK   and add that to -expected as well.
OK - Test that app.js does not require templates/src/_adapters/* unless they are currently being used.
OK - findUser & findPost produce with batchloader "null" found at char 681 near: "followed_by": null, "followi
OK   graphql/lib/run-time/feathers/extract-items.js#extractAllItems : return [] instead of null x2.
OK - Default specs.options.semicolons = true
OK - Include semicolons in generated code only is specs.options.semicolons === true
OK   This option can be changed manually in feathers-gen-specs.json.
OK   true HAS BEEN TESTED. false IS LEFT FOR MATT & MARSHALL TO TEST.
OK - Change copuright year from 2017 to 2018
OK - Remove templates we're now sure will not used.
OK - Generator comments out lines referring to $jsonSchema in name.service.js for mongodb services.
OK - ajv is a dependency in name.validate.js and has been added to package.json.
OK - add option for semicolons or not
OK - Temporarily display timer to show source scan is not slowing the startup.
OK - Are we scanning node_modules? No.
OK   Elapsed time is m ainly due to Yeoman.
OK - Implemented >generate options<.
OK - Fixed `all` generator to `await Generator.asyncInit(this)`
OK - Generated .eslintrc.json now respects specs.options.semicolons.
OK - Tracking David's generator. PRs 338-339 regarding typos.
OK - Made name.validate.js more customizable: added insert points, changed some const to let.
OK - .eslintrc.jon must handle the semicolon option.
OK - Added insertion points to src/authentication.js
OK - Fixed names of insertion points in name.service.js fort RethinkDB
OK - Added insertion points to name.service.js for non-mongodb, non-rethinkdb
OK - Added insertion points to src/middleware/index.js
OK   Not that the middleware modules themselves are never overridden once created.
OK - Added insertion points to knex-user.ejs
OK - Added insertion points to sequelize-user.ejs
OK - `generate options` now lists modules generator never rewritese.g. README.md.
OK - files without standard insertion points
       src
           hooks
               NO logger.js
           middleware
               OK index.ejs   
               NO middleware.ejs 
           services
               _model
                   OK knex-user.ejs (combine with knex.ejs?)
                   OK sequelize-user.ejs (combine with sequelize.ejs?)
               _service
                   OK name.service.ejs    
                   OK name.service-rethinkdb.ejs (badly named insertion points)
           OK authentication.ejs
           NO channels.ejs
       test
           services
               NO name.test.ejs
           NO app.test.ejs
OK - Enabled Feathers authentication on services for services called in
     GraphQL resolver functions.
     Combined changes for graphql and generator-feathers-plus
     - Summary:
     - params.provider, user & authenticated are copied from the
       graphql service call into the params for every Feathers service call
       in a resolver or BatchLoader.
     - If you need additional props to be copied over, include their names in
       `options.extraAuthProps` and `convertArgsToFeathers`. See below.
     - For custom resolvers or BatchLoaders, you need to record the
       `convertArgsToFeathers()` call as explained in the details.
     - Note you can enable authentication on a Feathers service or graphql
       only if you've run `generate authentication` first.
     - Details:
     - 'content' param in resolver calls now contains
       provider: params.provider, user: params.user &
       authenticated: params.authenticated (if any) from the /graphql call.
     - In `const createdService = createService(options);`
       options.extraAuthProps can pass an array of additional prop names
       to be copied from params to content.
       This allows other auth-related props to be copied into content.
     - The previous `convertArgsToFeathers(args, ast, {...})` is recoded to
       `const convertArgs = convertArgsToFeathers([/* prop names */]);`
       `...`
       `convertArgs(args, content, ast, {...})`
       where the `pop names` would normally be the same names used in
       `options.extraAuthProps`. These are additional props to copy into parms
       for the Feathers service call being made in the resolver function.  
OK - Custom code eye-catchers changed to avoid issues with linters.    
OK - The generated code use/converts to: '// !code:', '// !end', '// !<DEFAULT> code:'            
OK - Custom code is recognized when it starts with: ['// !code:', '// !<> code:',
OK   '//!code:', '// ! code:'];
OK - Custom code is recognized when it ends with: ['// !end', '//!end'];
OK - Changed test suite in 7,500+ places.
OK - Added comments to name.schema.js so people feel more comfortable adding models.
OK - Added uniqueItemProperties (name borrowed from Ajv extensions)
OK   to name.schema.js to identify fields with unique values in collection.
OK - Mongoose model now adds `required: true` for required props.
OK - Mongoose model now adds `unique: true` for uniqueItemProperties props.
OK - Changed design of feathers-gen-specs.json##connections to work with Sequelize
OK - ***** READ THIS **************************************************************
OK - You need to MANUALLY change the prop names in feathers-gen-specs.json##connections
OK   from something like 'postgres+sequelize' to 'sequelize' alone. More likely you'll
OK   be changing 'mongodb+mongodb' to 'mongodb'.  
OK - ******************************************************************************       
- Sequelize
  - Sequelize works with Postgres, MySQL, SQLite and MS SQL server only.  
  - David's generator creates one instance of Sequelize.
  - A Sequelize instance can connect to one database.
  - So a Sequelize instance can connect to one PostgreSQL, or SQLite, etc.
- David's generator, when the Sequelize adapter is selected for a service
  - You are asked to select the DB.
  - The choices include NeDB, memory, etc which would be invalid.
  - You are asked for the DB for every service, even though only 1 DB can be used.
  - src/sequelize.js is written customized for the first DB selected.
  - It is not rewritten on `generate service` effectively making the DB choice meaningless.
  - It is rewritten on `generate connection`, which is how you can reset the DB selected.
- New generator, when a service is being created/changed for Sequelize or Knex
  - Does not ask for a DB if a Sequelize connection already exists.
  - Displays only Postgres, MySQL, SQLite and MSSQL as DB choices.
  - It is rewritten on `generate connection`, which is how you can reset the DB selected. 
OK - Compare David's Sequelize src to ours
OK - Write Sequelize test.
OK - create src/services/name/name.sequelize.js
OK - create src/models/name.model.js for sequelize
OK - create src/models/name.model.js for sequelize user-entity with authentication
OK - moved model templates under templates/src/_model
OK - duplicate oauthProvider code in service and connection
OK - code-fragments.js does a `require` on name.schema.js. This gets the default schema merged with
     custom changes. Only the default schema is wanted. This will mess up the regenerated module.
OK - PUT BACK f+/graphql in package.json for fx/cli-gen-ex
OK - name.schema.*#extensions.graphql.name s/b default to `nameSingular`
OK - put adapter-info into expanded service specs.
OK - adapter-info: use elsewhere?
OK - add f-auth-mgnt fields to graphql auth
OK - `json-schema-deref-sync` converts `type: 'ID'` to `type: 'string'` which is incorrect for primary keys.
     This doesn't seem to be the case.
OK - rename production dependencies
OK - check if any dependencies before scheduling install
OK - mention src/services/name/name.class.*s are not regenerated
OK - alpha order for .ts and in front of the package.json
OK - test f-auth-mgnt fields to graphql auth  
OK - adapter-info: Make sure generic adapter can work somehow. 
OK - test name.sequelize.js
OK - adapter-info: Make sure generic adapter can work somehow.
OK - add
OK   Update available 3.6.1 → 3.6.2        │
OK   Run npm i -g @feathersjs/cli to update
OK - Hi, I’ve got a short question: is it possible to generate Typescript typings from the backend
     from the services, that can be used to type the feathers-client? name.interface.ts
OK - test name.mongo.js
OK - Also test generic adapter for .js and .ts
OK - New code locations any place its reasonable to add custom code.
     Pay extra attention to the _adapters, _model, _service templates
OK - Consider which generated code to instead make default code, creating a new code location there.
OK - Generated README does not contain the correct cli-plus commands.
OK - uncomment extensions.graphql.name and extensions.graphql.service?
OK - document name.validate.?s


NO - hooks modules should be ifNew: true
NO - should class.js and class-async.js be in their own folder?
NO - lib/generator.js defaultConfig needs to change if config/default.js is to be used
NO - add initial/updating for connections. Right now we just mention first ever connection.
NO - in graphql, feathers-batch-loader.js#serializeRecordKey & serializeDataLoaderKey should use
NO   feathers-plus-common/object/sortKeys if param is object to organize props in order
NO   else the two won't be considered "equal".
NO   --> Let user handle this as we think object keys will be rarely used. 
NO - Let's say we had mongodb services and changed them to NeDB. connentions['mongodb+mongodb'] will
NO   remain. This causes, for example, src/mongodb.js to still be generated.
NO   Basically, the generator does not remove info in specs that's no longer relavent.
NO - If we gen an NeDB service & add custom code to name.service.js. Then we regen to mongo. Then we
     regen back to NeDB. We do not include the previous custom code for NeDB. We could have
     diff insertion point names for each adapter, nedb_import, mongo_import. We could write a
     module (not called from anywhere) containing all scanned custom code that has not been used in
     the current regen. That module is basically a container for custom code we no longer use.\
     It can be scanned every regen. So it we regen from mongo to nedb, we'd pick up the custom
     code that was stashed away before.
     Main problem: If we regen a service, we have to know which modules contain custom code we have
     to consider for stashing. Basically, if we regen middleware, we won't be regen'ing graphql, so
     scanned graphql custom code would not be used in the regen. Yet we don't want to stash this.
NO - Check node version is 8+ (6+) in feathers-plus/cli. Already checked in lib/generator.js   
NO - "Hi, anyone knows how to make feathers-cli generate services in plural mode but model in singular mode?
     its ok to use plural for services, but kind of wired for models"  

- prevent reserved words being used as service names. Exclude graphql also. https://www.npmjs.com/package/reserved-words
- add ?!? notNullFields: [] in JSON-schema? Need to update validation, mongodb, mongoose
- Do we create `db.collection.createIndex({ fieldName: 1 }, { unique: true })`
  for `uniqueItemProperties`? In say name.mongo.js?

- Handle memberIds[] for batchloaders.
- Any custom code found that is not reinserted into regenerated modules is cached in a temp module
  so you can cut/paste it if needed.
- Cache hashes for all default code created in a module.
  When scanning for custom code, compare any default code found to the cached hash.
  This would find code where <DEFAULT> was not removed.

- add elasticsearch support when generating a database
- I think if we were to do migrations they shoudl be feathers based, i.e. db agnostic (as far as SQL vs NoSQL allows)
- gen code if server is part of a set of microservices.

- test name.validate.js
- add option: run tslint --fix / eslint --fix afterwards ?!? (watch for removal of trailing commas
  Alternatively have pretty-stringify produce single rather than double quotes.
- add comment in hooks regarding context.params.graphql for services included in graphql
- add sort one 1 prop in array of objects, sort on multiple prop names to BatchLoader. See f-x/common-utils
- what is feathersjs/cli/lib/shell.js

- prompt for softDelete (after testing discard('password') on users with auth)
- prompt and inert feathers-authentication-management. Need to handle arrays for SQL servers.
  - Will need to update feathersjs/authentication to check some extra fields
  - Figure out how to define schema for extra fields in Sequelize/PSQL,... and Knex/...
  - Handle outstanding issue with repo.
  - Write sample emails.
- prompt for i18n support  
- what can we do with feathers-sync?

- validation pass over services/name.schema.*s
- error checking pass over specs (plus some custom code),
  e.g. email/password exists in schema of user-entity when local auth selected.

- create Knex schema
- finalize and test support for Knex services.
- add docs example with memberIds: [...] to tests
- support memberIds: [...] in batchloaders

- add async init https://github.com/feathersjs/feathers/issues/509
- add stress test https://blog.feathersjs.com/stress-testing-your-feathersjs-application-like-in-production-4b8611ee8d9e
- add async feathers startup
- how to override ErrorHandler (a generator?)
- create fastJoin definitions
- create definitions for swagger
- create rate limiter for socket.io. luc.claustres asked about one on Slack
- expand generator for authentication
    - optionally include Basic Authentication ??!??
    - optionally include feathers-authentication-management (which may use a refactoring)
- create generator for deployment   
- create workflow. luc.claustres asked about one on Slack.
- generate for feathers-client (Vue, Redux, etc)
- bring dependencies up to date

- Allow last hook to execute e.g.
    .hooks({
      before: {
        all: [first],
        find: [second]
      }
    }).hooks({
      before: [ last ]
    });

- tests:
describe('Feathers application tests', () => {
  before(function (done) {
    this.server = stoppable(app.listen(port), 0);
    this.server.once('listening', () => done());
  });

  after(function (done) {
    this.server.stop(done);
  });

FINAL CHECKS
- Consistency, e.g. name.sequelize.js lists needed fields for user-entity while others don't.


- Several templates may have the same app module as their destination. Each of these
  templates needs to be tested for .ts .
  - src/models/name.model.*s
    - knex for the user-entity service
    - knex for other service
    OK - mongoose for the user-entity service
    OK - mongoose for other service
    OK - nedb for the user-entity service
    OK - nedb for other service
    OK - sequelize for the user-entity service
    OK - sequelize for other service
  - src/services/name/name.service.*s
    OK - mongo service
    - rethink service
    OK - other adapters use a common template
  - src/*.*s
    - knex.*s
    OK - mongodb.*s
    OK - mongoose.*s
    - rethinkdb.*s
    - sequelize.*s for MS SQL Server
    OK - sequelize.*s for other DBs use a common template
        
