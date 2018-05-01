
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

> Your app can obtain information about the app at run-time by reading `feathers-gen-specs.json`.
It can, for example, determine the adapter used by a service and then use that information to
decide which hooks to run.

> `feathers-gen-specs.json` combined with the output from `generate codelist` completely
describe the generated modules. The generator can re-generate the project with this information.
