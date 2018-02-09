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

NO - hooks modules should be ifNew: true
NO - should class.js and class-async.js be in their own folder?
NO - lib/generator.js defaultConfig needs to change if config/default.js is to be used
NO - add initial/updating for connections
NO - in graphql, feathers-batch-loader.js#serializeRecordKey & serializeDataLoaderKey should use
NO   feathers-plus-common/object/sortKeys if param is object to organize props in order
NO   else the two won't be considered "equal".
NO   --> Let user handle this as we think object keys will be rarely used. 
NO  Are we scanning node_modules?

LATER - findUser & findPost produce with batchloader "null" found at char 681 near: "followed_by": null, "followi
LATER   graphql/lib/run-time/feathers/extract-items.js#extractAllItems : return [] instead of null x2.

- ajv is likely a dependency for generate service.
- add quickCheckCreate(data, options) inside $name$.validate.js.
- remove $schema from name.validate.js and from name.mongo.js

- Why is startup so slow?
- add option for semicolons or not
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
  
- create Sequelize schema
- create fastJoin definitions
- create for swagger
- bring dependencies up to date

- removed $schema prop from schemas