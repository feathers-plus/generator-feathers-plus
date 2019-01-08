
const assert = require('yeoman-assert');
const cp = require('child_process');
const fs = require('fs-extra');
const helpers = require('yeoman-test');
const klawSync = require('klaw-sync');
const merge = require('lodash.merge');
const path = require('path');
require('colors');
const jsDiff = require('diff');

const { resetForTest: resetSpecs } = require('../lib/specs');

const packageInstaller = 'npm'; // npm measured as faster than yarn for this
const tests = [
  /*
   Repo generator-old-vs-new contains app's generated with the same prompts
   using David's generator and the new generator. You can use various tools to compare the source
   between these to identify differences in the generated code.

   The `t#` were generated using David's generator. The `z#` using the new one.
   Matching app's have the same number, i.e. t1 and z1 were generated using the same prompts.

   The `z#` are copied to this test dir under names like app.test-expected.
   This test compares the currently generated source to e.g. app.test-expected which
   essentially is a comparision with the source produced by David's generator.

   `npm run mocha:code` will compare the source produced by the tests. Its very fast
   because it does not install the dependencies.
   `npm run mocha:tests` will run `npm test` for each test. Its very slow as it has to
   install dependencies.
   `npm test` runs both of the above.
   The tests stop running on the first assertion failure.
   */

  // t0, z0 Test scaffolding to execute multiple generate calls and check the final result.
  // Also test a missing specs.options is created.
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  { testName: 'scaffolding.test',
    specsChanges: [
      { generate: 'all', before: specs => delete specs.app.providers, merge: { app: { providers: ['primus'] } } },
      { generate: 'all', before: specs => delete specs.app.providers, merge: { app: { providers: ['rest'] } } },
      { generate: 'all', before: specs => delete specs.app.providers, merge: { app: { providers: ['rest', 'socketio'] } } },
      { generate: 'all', prompts: { confirmation: true } }
    ],
    compareDirs: true,
    execute: false,
  },

  // t01, z01 Test creation of app.
  //  generate app            # z-1, Project z-1, npm, src1, socketio (only)
    { testName: 'app.test' },

  // Test when .eslintrc.json file already exists
    { testName: 'app-eslintrc.test' },

  // Test using feathers-gen-code.js for code
    { testName: 'app-code-blocks.test' },

  // t02, z02 (z01 ->) Test service creation without authentication scaffolding.
  // Also test any missing specs.options props are created.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //  generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //  generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
    { testName: 'service.test' },

  // t03, z03 (z02 ->) Test middleware creation.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //* generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
  //  generate middleware     # mw1, *
  //  generate middleware     # mw2, mw2
    { testName: 'middleware.test' },

  // t04, z04 (z02 ->) Test graphql endpoint creation.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //* generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
  // z04 only
  //  Add schemas for nedb1 and nedb2
  //  Regenerate nedb1 and nedb2
  //  generate graphql        # service calls, /graphql,
    { testName: 'graphql.test' },

  // (z04 ->) Test graphql endpoint creation with authentication.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //  generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth Y, graphql Y
  //* generate service        # NeDB, nedb2, /nedb-2,                 auth Y, graphql Y
  // z04 only
  //  Add schemas for nedb1 and nedb2
  //  Regenerate nedb1 and nedb2
  //  generate graphql        # service calls, /graphql,
    { testName: 'graphql-auth.test' },

  // t05, z05 Test authentication scaffolding.
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
    { testName: 'authentication-1.test' },

  // t06, z06 (z05 ->) Test creation of authenticated service with auth scaffolding.
  //* generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //* generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
  //  generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth Y, graphql Y
    { testName: 'authentication-2.test' },

  // t07, z07 (z06 ->) Test creation of non-authenticated service with auth scaffolding.
  //* generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //* generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth Y, graphql Y
  //  generate service        # NeDB, nedb2, /nedb-2, nedb://../data, auth N, graphql Y
    { testName: 'authentication-3.test' },

  // t08, z08 Test everything together. Mainly used to test different adapters.
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local+Auth0+Google+Facebook+GitHub,
  //                            users1, Nedb, /users-1, nedb://../data, auth Y, graphql N
  //  generate service        # NeDB, nedb1, /nedb-1, auth Y, graphql Y
  //  generate service        # NeDB, nedb2, /nedb-2, auth N, graphql Y
  //  generate middleware     # mw1, *
  //  generate middleware     # mw2, mw2
  // z08 only
  //  Add schemas for users1, nedb1 and nedb2 --> ADD BOTH schema.properties AND extensions <--
  //  Regenerate users1, nedb1 and nedb2
  //  generate graphql        # service calls, /graphql, auth N
    { testName: 'cumulative-1-nedb.test' },

  // t08, z08 Test everything together. Mainly used to test different adapters.
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local+Auth0+Google+Facebook+GitHub,
  //                            users1, generic, auth Y, graphql N
  //  generate service        # NeDB, generic, /nedb-1, auth Y, graphql Y
  //  generate service        # NeDB, generic, /nedb-2, auth N, graphql Y
  //  generate middleware     # mw1, *
  //  generate middleware     # mw2, mw2
  // z08 only
  //  Add schemas for users1, nedb1 and nedb2 --> ADD BOTH schema.properties AND extensions <--
  //  Regenerate users1, nedb1 and nedb2
  //  generate graphql        # service calls, /graphql, auth N
    { testName: 'cumulative-1-generic.test' },

  // t08-memory, z08-memory The same as t08 & z08 but using @f/memory.
  // Service names remain nedb1 & nedb2.
    { testName: 'cumulative-1-memory.test' },

  // t08-mongo, z08-mongo The same as t08 & z08 but using @f/mongodb.
  // Service names remain nedb1 & nedb2; use default connection string.
    { testName: 'cumulative-1-mongo.test' },

  // t08-mongoose, z08-mongoose The same as t08 & z08 but using @f/mongoosedb.
  // Service names remain nedb1 & nedb2; use default connection string.
    { testName: 'cumulative-1-mongoose.test' },

  // The same as t08 & z08 but using options: { semicolons: false }
    { testName: 'cumulative-1-no-semicolons.test' },

  // t08-sequelize, z08-sequelize The same as t08 & z08 but using @f/sequelize & PostgreSQL.
  // Service names remain nedb1 & nedb2; use default connection string.
    { testName: 'cumulative-2-sequelize-services.test' },

  // The same as t08 & z08 but using options: { graphql: { strategy: 'batchloaders' } }
  // Service names remain nedb1 & nedb2; use default connection string.
    { testName: 'cumulative-2-nedb-batchloaders.test' },

  // Test hook generation with associated tests
    { testName: 'cumulative-2-hooks.test' },

  // Test generating unit hook tests
    { testName: 'a-gens/js/test-hook-unit.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.app1' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb12' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.manual' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb1' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb2' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating integration hook tests
    { testName: 'a-gens/js/test-hook-integ.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.app1' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb12' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.manual' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb1' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb2' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating service tests
    { testName: 'a-gens/js/test-service.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'serviceUnit', serviceName: 'nedb1' } },
        { generate: 'test', prompts: { testType: 'serviceUnit', serviceName: 'nedb2' } },
        { generate: 'test', prompts: { testType: 'serviceInteg', serviceName: 'nedb1' } },
        { generate: 'test', prompts: { testType: 'serviceInteg', serviceName: 'users1' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating authentication tests
  // Its tests TEST AUTHENTICATION and should be periodically run with dependency loading
    { testName: 'a-gens/js/test-authentication.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'authBase' } },
        { generate: 'test', prompts: { testType: 'authServices' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // t21, z21 Test switching the user-entity
  // t21
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local+Auth0+Google+Facebook+GitHub,
  //                            users1, Nedb, /users-1, nedb://../data, auth Y, graphql N
  //  generate service        # NeDB, nedb1, /nedb-1, auth Y
  // z21
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local+Auth0+Google+Facebook+GitHub,
  //                            nedb1, Nedb, /nedb-1, nedb://../data, auth Y, graphql Y
  //  generate authentication # Local+Auth0+Google+Facebook+GitHub,
  //                            users1, Nedb, /users-1, nedb://../data, auth Y, graphql N
  //  generate service        # NeDB, nedb1, /nedb-1, auth Y (line not needed in test as test regens whole app)
    { testName: 'regen-user-entity.test',
      specsChanges: [
        { generate: 'all', merge: {
            authentication: { entity: 'users1' },
            services: {
              nedb1: { isAuthEntity: false },
              users1: {
                name: 'users1',
                nameSingular: 'users1',
                subFolder: '',
                fileName: 'users-1',
                adapter: 'nedb',
                path: '/users-1',
                isAuthEntity: true,
                requiresAuth: true,
                graphql: false
              },
            }
          } },
      ]
    },

  // z22 Test that app.js does not require templates/src/_adapters/* unless they are currently being used.
  // Also tests that existing package.json, config/default.json & config/production.json contents are retained.
  //  generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //  generate service        # MongoDB, nedb1, /nedb-1, mongodb://localhost:27017/z_1, auth N, graphql Y
  //  generate service        # NeDB,    nedb1, /nedb-1, nedb://../data,                auth N, graphql Y
    { testName: 'regen-adapters-1.test',
      specsChanges: [
        { generate: 'all', merge: {
            services: { nedb1: { adapter: 'nedb' } },
            connections: {
              'nedb': {
                database: 'nedb',
                adapter: 'nedb',
                connectionString: 'nedb://../data'
              }
            }
          } },
      ]
    },

  // test service in sub-folders
    { testName: 'name-space.test' },

  // test old and new service folder/file naming
    { testName: 'service-naming.test' }, // execute: true

  // .ts version of cconst logger = require('./logger')umulative-1-nedb.test
    { testName: 'ts-cumulative-1-nedb.test' },

  // .ts version of cumulative-1-generic.test
    { testName: 'ts-cumulative-1-generic.test' },

  // .ts version of cumulative-1-memory.test
    { testName: 'ts-cumulative-1-memory.test' },

  // .ts version of cumulative-1-mongo.test
    { testName: 'ts-cumulative-1-mongo.test' },

  // .ts version of cumulative-1-mongoose.test
    { testName: 'ts-cumulative-1-mongoose.test' },

  // .ts version of cumulative-2-sequelize-services.test
    { testName: 'ts-cumulative-2-sequelize-services.test' },

  // Test hook generation with associated tests
    { testName: 'ts-cumulative-2-hooks.test' },

  // Test generating unit hook tests
    { testName: 'a-gens/ts/test-hook-unit.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.app1' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb12' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.manual' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb1' } },
        { generate: 'test', prompts: { testType: 'hookUnit', hookName: 'hook.nedb2' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating integration hook tests
    { testName: 'a-gens/ts/test-hook-integ.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.app1' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb12' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.manual' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb1' } },
        { generate: 'test', prompts: { testType: 'hookInteg', hookName: 'hook.nedb2' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating service tests
    { testName: 'a-gens/ts/test-service.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'serviceUnit', serviceName: 'nedb1' } },
        { generate: 'test', prompts: { testType: 'serviceUnit', serviceName: 'nedb2' } },
        { generate: 'test', prompts: { testType: 'serviceInteg', serviceName: 'nedb1' } },
        { generate: 'test', prompts: { testType: 'serviceInteg', serviceName: 'users1' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // Test generating authentication tests
    { testName: 'a-gens/ts/test-authentication.test',
      specsChanges: [
        { generate: 'test', prompts: { testType: 'authBase' } },
        { generate: 'test', prompts: { testType: 'authServices' } },
      ],
      compareDirs: true,
      execute: false,
    },

  // test service in sub-folders
    { testName: 'ts-name-space.test' },

  // Test specs created by generator prompts
    { testName: 'a-specs/connection-memory.test',
      specsChanges: [
        { generate: 'connection',
          prompts: { database: 'memory' },
          calledByTest: { prompts: { database: 'memory' } }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mongodb-mongodb.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mongodb', adapter: 'mongodb', connectionString: 'mongodb://localhost:27017/zz' },
          calledByTest: {
            prompts: { database: 'mongodb', adapter: 'mongodb', connectionString: 'mongodb://localhost:27017/zz' },
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mongodb-mongoose.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mongodb', adapter: 'mongoose', connectionString: 'mongodb://localhost:27017/zz' },
          calledByTest: {
            prompts: { database: 'mongodb', adapter: 'mongoose', connectionString: 'mongodb://localhost:27017/zz' },
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mysql-sequelize.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mysql', adapter: 'sequelize', connectionString: 'mysql://root:@localhost:3306/zz' },
          calledByTest: {
            prompts: { database: 'mysql', adapter: 'sequelize', connectionString: 'mysql://root:@localhost:3306/zz' },
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mysql-knex.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mysql', adapter: 'knex', connectionString: 'mysql://root:@localhost:3306/zz' },
          calledByTest: {
            prompts: { database: 'mysql', adapter: 'knex', connectionString: 'mysql://root:@localhost:3306/zz' },
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-nedb.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'nedb', connectionString: '../data' },
          calledByTest: { prompts: {database: 'nedb', connectionString: '../data'} }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-postgres-sequelize.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'postgres', adapter: 'sequelize', connectionString: 'postgres://postgres:@localhost:5432/zz' },
          calledByTest: {
            prompts: { database: 'postgres', adapter: 'sequelize', connectionString: 'postgres://postgres:@localhost:5432/zz' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-postgres-knex.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'postgres', adapter: 'knex', connectionString: 'postgres://postgres:@localhost:5432/zz' },
          calledByTest: {
            prompts: { database: 'postgres', adapter: 'knex', connectionString: 'postgres://postgres:@localhost:5432/zz' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-rethinkdb.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'rethinkdb', connectionString: 'rethinkdb://localhost:28015/zz' },
          calledByTest: {
            prompts: { database: 'rethinkdb', connectionString: 'rethinkdb://localhost:28015/zz' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-sqlite-sequelize.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'sqlite', adapter: 'sequelize', connectionString: 'sqlite://zz.sqlite' },
          calledByTest: {
            prompts: { database: 'sqlite', adapter: 'sequelize', connectionString: 'sqlite://zz.sqlite' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-sqlite-knex.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'sqlite', adapter: 'knex', connectionString: 'sqlite://zz.sqlite' },
          calledByTest: {
            prompts: { database: 'sqlite', adapter: 'knex', connectionString: 'sqlite://zz.sqlite' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mssql-sequelize.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mssql', adapter: 'sequelize', connectionString: 'mssql://root:password@localhost:1433/zz' },
          calledByTest: {
            prompts: { database: 'mssql', adapter: 'sequelize', connectionString: 'mssql://root:password@localhost:1433/zz' }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/connection-mssql-knex.test',
      specsChanges: [
        {
          generate: 'connection',
          prompts: { database: 'mssql', adapter: 'knex', connectionString: 'mssql://root:password@localhost:1433/zz' },
          calledByTest: {
            prompts: { database: 'mssql', adapter: 'knex', connectionString: 'mssql://root:password@localhost:1433/zz' }
          }
        }
      ],
      compareDirs: false,
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-generic.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'generic',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'generic',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-memory.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'memory',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'memory',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-nedb.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'nedb',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'nedb', connectionString: '../data'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'nedb',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'nedb', connectionString: '../data'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-mongodb.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'mongodb',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mongodb', connectionString: 'mongodb://localhost:27017/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'mongodb',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mongodb', connectionString: 'mongodb://localhost:27017/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-mongoose.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'mongoose',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mongodb', connectionString: 'mongodb://localhost:27017/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'mongoose',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mongodb', connectionString: 'mongodb://localhost:27017/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-sequelize-mysql.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'sequelize',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mysql', connectionString: 'mysql://root:@localhost:3306/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'sequelize',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mysql', connectionString: 'mysql://root:@localhost:3306/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-sequelize-postgres.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'sequelize',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'postgres', connectionString: 'postgres://postgres:@localhost:5432/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'sequelize',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'postgres', connectionString: 'postgres://postgres:@localhost:5432/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-sequelize-sqlite.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'sequelize',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'sqlite', connectionString: 'sqlite://zz.sqlite'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'sequelize',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'sqlite', connectionString: 'sqlite://zz.sqlite'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-knex-mysql.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'knex',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mysql', connectionString: 'mysql://root:@localhost:3306/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'knex',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mysql', connectionString: 'mysql://root:@localhost:3306/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-knex-postgres.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'knex',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'postgres', connectionString: 'postgres://postgres:@localhost:5432/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'knex',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'postgres', connectionString: 'postgres://postgres:@localhost:5432/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-knex-sqlite.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'knex',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'sqlite', connectionString: 'sqlite://zz.sqlite'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'knex',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'sqlite', connectionString: 'sqlite://zz.sqlite'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-knex-mssql.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'knex',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mssql', connectionString: 'mssql://root:password@localhost:1433/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'knex',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mssql', connectionString: 'mssql://root:password@localhost:1433/zz'
            }
          }
        }
      ],
      compareOnlySpecs: true
    },

    {
      testName: 'a-specs/service-sequelize-mssql.test',
      specsChanges: [
        {
          generate: 'service',
          prompts: {
            adapter: 'sequelize',

            isAuthEntity: false, name: 'users', nameSingular: 'user',
            subFolder: '', path: '/users', graphql: false,

            database: 'mssql', connectionString: 'mssql://root:password@localhost:1433/zz'
          },
          calledByTest: {
            name: 'users',
            prompts: {
              adapter: 'sequelize',

              isAuthEntity: false, name: 'users', nameSingular: 'user',
              subFolder: '', path: '/users', graphql: false,

              database: 'mssql', connectionString: 'mssql://root:password@localhost:1433/zz'
            }
          }
        }
      ],
      compareDirs: true, // make sure src/sequelize-mssql.js is generated
      execute: false,
    },

  // Test generating app using only generate commands (except for an initialization step)
  //
  // The this._opts.calledByTest in a generator will contain the specsChanges.calledByTest value.
  //
  // The generator's answer.name in prompting() is set to the specsChanges.prompts.name value
  // only when the prompt would have been displayed. So prompts whose when() returns false will
  // not have their answers.name set to specsChanges.prompts.name.
  //
  // These functions in prompting() are called but no console.log are displayed: name, message.
  // These are called and console.log are displayed: when.
  // These are not called: default, filter, validate. This makes it awkward to pass default
  // values to prompts which use these function to obtain default values.
  //
  // We therefore standardized on passing the prompts in specsChanges.calledByTest.prompts as well.
  // "Missing" prompt values can be set by the generator at the end of prompting().
    { testName: 'a-gens/js/cumulative.test',
      specsChanges: [
        { generate: 'app',
          prompts: {
            name: 'z-1',
            src: 'src1',
            description: 'Project z-1',
            packager: 'npm@>= 3.0.0',
            providers: [ 'rest', 'socketio' ],
            environmentsAllowingSeedData: 'test',
            seedData: false,
          },
          calledByTest: {
            prompts: {
              name: 'z-1',
              src: 'src1',
              description: 'Project z-1',
              packager: 'npm@>= 3.0.0',
              providers: [ 'rest', 'socketio' ],
              environmentsAllowingSeedData: 'test',
              seedData: false,
            }
          }
        },
        { generate: 'connection',
          prompts: {
            adapter: 'nedb',
            database: 'nedb',
            connectionString: '../data'
          },
          calledByTest: {
            prompts: {
              adapter: 'nedb',
              database: 'nedb',
              connectionString: '../data'
            },
          }
        },
        { generate: 'service',
          prompts: {
            name: 'users1',
            nameSingular: 'users1',
            subFolder: '',
            adapter: 'nedb',
            path: '/users-1',
            graphql: false
          },
          calledByTest: {
            name: 'users1',
            prompts: {
              name: 'users1',
              nameSingular: 'users1',
              subFolder: '',
              adapter: 'nedb',
              path: '/users-1',
              graphql: false
            }
          }
        },
        { generate: 'authentication',
          prompts: {
            strategies: [ 'local', 'auth0', 'google', 'facebook', 'github' ],
            entity: 'users1'
          },
          calledByTest: {
            prompts: {
              strategies: [ 'local', 'auth0', 'google', 'facebook', 'github' ],
              entity: 'users1'
            },
          }
        },
        { generate: 'service',
          prompts: {
            isAuthEntity: false,
            requiresAuth: true,
            name: 'nedb1',
            nameSingular: 'nedb1',
            adapter: 'nedb',
            subFolder: '',
            path: '/nedb-1',
            graphql: true
          },
          calledByTest: {
            name: 'nedb1',
            prompts: {
              isAuthEntity: false,
              requiresAuth: true,
              name: 'nedb1',
              nameSingular: 'nedb1',
              adapter: 'nedb',
              subFolder: '',
              path: '/nedb-1',
              graphql: true
            },
          }
        },
        { generate: 'service',
          prompts: {
            isAuthEntity: false,
            requiresAuth: false,
            name: 'nedb2',
            nameSingular: 'nedb2',
            adapter: 'nedb',
            subFolder: '',
            path: '/nedb-2',
            graphql: true
          },
          calledByTest: {
            name: 'nedb2',
            prompts: {
              isAuthEntity: false,
              requiresAuth: true,
              name: 'nedb1',
              nameSingular: 'nedb1',
              adapter: 'nedb',
              subFolder: '',
              path: '/nedb-1',
              graphql: true
            },
          }
        },
        { generate: 'middleware',
          prompts: {
            name: 'mw1',
            path: '*',
            kebabName: 'mw-1',
            camelName: 'mw1'
          },
          calledByTest: {
            prompts: {
              name: 'mw1',
              path: '*',
              kebabName: 'mw-1',
              camelName: 'mw1'
            },
          }
        },
        { generate: 'middleware',
          prompts: {
            name: 'mw2',
            path: 'mw2',
            kebabName: 'mw-2',
            camelName: 'mw2'
          },
          calledByTest: {
            prompts: {
              name: 'mw2',
              path: 'mw2',
              kebabName: 'mw-2',
              camelName: 'mw2'
            },
          }
        },
        { generate: 'graphql',
          prompts: {
            strategy: 'services',
            path: '/graphql',
            requiresAuth: false,
            snakeName: 'graphql',
            kebabName: 'graphql',
            camelName: 'graphql'
          },
          calledByTest: {
            prompts: {
              strategy: 'services',
              path: '/graphql',
              requiresAuth: false,
              snakeName: 'graphql',
              kebabName: 'graphql',
              camelName: 'graphql'
            },
          }
        },
        // since the services are not regenerated, no name.populate.js files are generated
      ],
      compareDirs: true,
      execute: false,
    },
];

let appDir;
const runFromTest = null; //'cumulative-1-sequelize.test'
const runToTest = null; //'cumulative-1-sequelize.test' //null;
const executeAll = false;

let runTests = !runFromTest;

describe('generators-writing.test.js', function () {
  tests.forEach(({ testName, specsChanges = [], compareDirs = true, compareOnlySpecs = false, execute = false }) => {
    if (runFromTest && runFromTest === testName) runTests = true;
    if (runToTest && runToTest === testName) runTests = false;
    if (!runTests) return;

    describe(testName, function () {
      it('writes code expected', () => {
        return runFirstGeneration(testName, { skipInstall: true })
          .then(dir => {

            // There is no second generation step
            if (!specsChanges.length) {
              return compareOnlySpecs ?
                compareSpecs(appDir, `${testName}-expected`) :
                compareCode(dir, `${testName}-expected`, compareDirs);
            }

            // Generate on top of contents of working directory
            return runNextGenerator(dir, specsChanges, { skipInstall: true })
              .then(dir => {
                return compareOnlySpecs ?
                  compareSpecs(appDir, `${testName}-expected`) :
                  compareCode(dir, `${testName}-expected`, compareDirs);
              });
          });
      });

      if (executeAll || execute) {
        it('runs test generated', () => {
          return runFirstGeneration(testName, { skipInstall: false })
            .then(dir => {

              // There is no second generation step
              if (!specsChanges.length) {
                return runExecute(dir);
              }

              // Generate on top of contents of working directory
              return runNextGenerator(dir, specsChanges, { skipInstall: false })
                .then(dir => runExecute(dir));

              function runExecute(dir) {
                return runGeneratedTests('starts and shows the index page')
                  .then(() => {
                    const pkg = require(path.join(dir, 'package.json'));

                    // Weak test that dependencies were added
                    assert.ok(pkg.devDependencies.mocha, 'Added mocha as a devDependency');
                  });
              }
            });
        });
      }
    });
  });
});

// Run the first generator
function runFirstGeneration (testName, withOptions) {
  //console.log('>runFirstGeneration', testName, withOptions);
  return helpers.run(path.join(__dirname, '..', 'generators', 'all'))
    .inTmpDir(dir => {
      appDir = dir;
      // specs.app.name must be 'z-1' not 'z1' as Feathers-generate app converts the project name
      // to kebab-case during the prompt.
      //console.log('288', path.join(__dirname, '..', 'test-expands', `${testName}-copy`), dir);
      fs.copySync(path.join(__dirname, '..', 'test-expands', `${testName}-copy`), dir);

      resetSpecs();
    })
    .withPrompts({
      confirmation: true,
      action: 'force' // force file overwrites
    })
    .withOptions(Object.assign({}, { calledByTest: true }, withOptions));
}

// Run subsequent generators
// Return working directory containing last generated app.
function runNextGenerator(dir, specsChanges, withOptions, index = 1) {
  //console.log('>runNextGenerator', dir);
  if (!specsChanges.length) return;
  const specsChg = specsChanges.shift();

  if (specsChg.prompts) {
    return doGenerate(specsChg);
  } else {
    return doSpecChange(specsChg);
  }

  function doGenerate(specsChg) {
    return helpers.run(path.join(__dirname, '..', 'generators', specsChg.generate))
      .inTmpDir(dirNext => {
        appDir = dirNext;
        console.log(`      ${index + 1} "generate ${specsChg.generate}" with ${JSON.stringify(specsChg.prompts).substr(0, 60)}`);

        //console.log('314', dir, dirNext);
        fs.copySync(dir, dirNext);

        resetSpecs();
      })
      .withPrompts(Object.assign({},
        specsChg.prompts,
        { action: 'force' }, // force file overwrites
      ))
      .withOptions(Object.assign({}, { calledByTest: specsChg.calledByTest || true }, withOptions))
      .then(dir => {
        // There are no more generation steps
        if (!specsChanges.length) {
          return dir;
        }

        return runNextGenerator(dir, specsChanges, withOptions, ++index);
      });
  }

  function doSpecChange(specsChg) {
    return helpers.run(path.join(__dirname, '..', 'generators', 'all'))
      .inTmpDir(dirNext => {
        let nextJson;

        appDir = dirNext;
        console.log(`      ${index + 1} change specs ${JSON.stringify(specsChg.merge).substr(0, 65)}`);

        //console.log('314', dir, dirNext);
        fs.copySync(dir, dirNext);

        //console.log('317', path.join(dir, 'feathers-gen-specs.json'));
        const prevJson = fs.readJsonSync(path.join(dir, 'feathers-gen-specs.json'));
        if (specsChg.before) {
          specsChg.before(prevJson);
        }
        nextJson = specsChg.merge ? merge(prevJson, specsChg.merge) : prevJson;

        //console.log('322', path.join(dirNext, 'feathers-gen-specs.json'));
        fs.writeFileSync(path.join(dirNext, 'feathers-gen-specs.json'), JSON.stringify(nextJson, null, 2));

        resetSpecs();
      })
      .withPrompts({
        confirmation: true,
        action: 'force' // force file overwrites
      })
      .withOptions(withOptions)
      .then(dir => {
        // There are no more generation steps
        if (!specsChanges.length) {
          return dir;
        }

        return runNextGenerator(dir, specsChanges, withOptions, ++index);
      });
  }
}

// Run the 'test' script in package.json
function runGeneratedTests (expectedText) {
  // console.log('>runGeneratedTests');
  return runCommand(packageInstaller, ['test'], { cwd: appDir })
    .then(({ buffer }) => {
      if (buffer.indexOf(expectedText) === -1) {
        console.log(`\n\n===== runGeneratedTests. Expected "${expectedText}". Found:`);
        console.log(buffer);
      }

      assert.ok(buffer.indexOf(expectedText) !== -1,
        'Ran test with text: ' + expectedText);
    });
}

// Start a process and wait either for it to exit
// or to display a certain text
function runCommand (cmd, args, options, text) {
  console.log('..run shell command', cmd, args);
  return new Promise((resolve, reject) => {
    let buffer = '';

    function addToBuffer (data) {
      buffer += data;

      if (text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    }

    const child = cp.spawn(cmd, args, options);

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      if (status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
}

function compareCode (appDir, testDir, compareDirs) {
  // console.log('>compareCode', appDir, testDir, compareDirs);
  console.log('... comparing code');
  const appDirLen = appDir.length;
  const expectedDir = path.join(__dirname, '..', 'test-expands', testDir);

  const expectedPaths = getFileNames(expectedDir);
  const actualPaths = getFileNames(appDir);

  if (compareDirs === true) {
    assert.deepEqual(actualPaths.relativePaths, expectedPaths.relativePaths, 'Unexpected files in generated dir');
  }

  actualPaths.paths.forEach(actualPath => {
    compare(actualPath.path.substr(appDirLen), appDir, expectedDir);
  });

  /*
  const expectedDirLen = expectedDir.length;
  expectedPaths.paths.forEach(expectedPath => {
    compare(expectedPath.path.substr(expectedDirLen), appDir, expectedDir);
  });
  */
}

function compareSpecs (appDir, testDir) {
  console.log('... comparing feathers-gen-specs.json');
  const expectedDir = path.join(__dirname, '..', 'test-expands', testDir);

  compare(`${path.sep}feathers-gen-specs.json`, appDir, expectedDir);
}

function compare (fileName, appDir, expectedDir) {
  // console.log('compare files', fileName);
  let expected;

  // console.log('410', `${appDir}${fileName}`);
  let actual = fs.readFileSync(path.join(appDir, fileName), 'utf8');

  try {
    // console.log('414', `${expectedDir}${fileName}`);
    expected = fs.readFileSync(path.join(expectedDir, fileName), 'utf8');
  } catch (err) {
    console.log(actual);
    throw err;
  }
  // Get rid of any line ending differences
  actual = actual.replace(/\r?\n/g, '\n');
  expected = expected.replace(/\r?\n/g, '\n');

  const diff = jsDiff.diffChars(actual, expected);

  if (diff.length > 1) {
    // console.log('\nvvvvv actual module vvvvv');
    // console.log(actual);
    // console.log('^^^^^');
    console.log('\nvvvvv expected module vvvvv');
    console.log(expected);
    console.log('^^^^^');

    let str = diff.reduce(function(accum, part) {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'bgGreen' :
        part.removed ? 'bgRed' : 'grey';
      const value = /(\r\n)|(\r)|(\n)/.test(part.value) ? '<EOL DIFF>' : part.value;

      return accum + value[color];
    }, '');

    console.log('\nvvvvv module diff vvvvv');
    process.stderr.write(str);
    console.log('\n^^^^^');

    assert.equal(actual, expected, `Unexpected contents for file ${appDir}${fileName}`);
    // assert(diff.length === 1, `Unexpected contents for file ${appDir}${fileName}`);
  }
}

function getFileNames (dir) {
  // console.log('>getFileNames', dir);
  const nodes = klawSync(dir, { nodir: true })
    .filter(obj => obj.path.indexOf(`${path.sep}node_modules${path.sep}`) === -1 && obj.path.indexOf(`${path.sep}data${path.sep}`) === -1);

  return {
    paths: nodes,
    relativePaths: nodes.map(node => path.relative(dir, node.path)).sort()
  };
}
