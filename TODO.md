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
OK   Elapsed time is m ainly due to Yeoman.


NO - hooks modules should be ifNew: true
NO - should class.js and class-async.js be in their own folder?
NO - lib/generator.js defaultConfig needs to change if config/default.js is to be used
NO - add initial/updating for connections
NO - in graphql, feathers-batch-loader.js#serializeRecordKey & serializeDataLoaderKey should use
NO   feathers-plus-common/object/sortKeys if param is object to organize props in order
NO   else the two won't be considered "equal".
NO   --> Let user handle this as we think object keys will be rarely used. 
NO  Are we scanning node_modules?


- test name.mongo.js
- test name.validate.js

-
- what is feathersjs/cli/lib/shell.js

- Let's say we had mongodb services and changed them to NeDB. connentions['mongodb+mongodb'] will
  remain. This causes, for example, src/mongodb.js to still be generated.
  Basically, the generator does not remove info in specs that's no longer relavent.
- If we gen an NeDB service & add custom code to name.service.js. Then we regen to mongo. Then we
  regen back to NeDB. We do not include the previous custom code for NeDB. We could have
  diff insertion point names for each adapter, nedb_import, mongo_import. We could write a
  module (not called from anywhere) containing all scanned custom code that has not been used in
  the current regen. That module is basically a container for custom code we no longer use.\
  It can be scanned every regen. So it we regen from mongo to nedb, we'd pick up the custom
  code that was stashed away before.
  Main problem: If we regen a service, we have to know which modules contain custom code we have
  to consider for stashing. Basically, if we regen middleware, we won't be regennning graphql, so
  scanned graphql custom code would not be used in the regen. Yet we don't want to stash this.

- error checking pass over specs (plus some custom code),
  e.g. email/password exists in schema of user-entity when local auth selected.  
- create Sequelize schema
- create fastJoin definitions
- create for swagger
- bring dependencies up to date
