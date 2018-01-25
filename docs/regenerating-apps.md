
## Regenerating apps

Cli-plus persists a definition of the app in `project-name/feathers-gen-specs.json`.
This contains primarily the responses provided to the prompts used to create the app.

The `cli-generator-example` repo has the following specs:
```json
{
  "options": {
    "ver": "1.0.0",
    "inspectConflicts": false,
    "freeze": []
  },
  "app": {
    "src": "src",
    "packager": "npm@>= 3.0.0",
    "providers": [
      "rest",
      "socketio"
    ]
  },
  "services": {
    "comment": {
      "name": "comment",
      "fileName": "comment",
      "adapter": "nedb",
      "path": "/comment",
      "requiresAuth": false,
      "graphql": true
    },
    "user": {
      "name": "user",
      "fileName": "user",
      "adapter": "nedb",
      "path": "/user",
      "requiresAuth": false,
      "graphql": true
    },
    "like": {
      "name": "like",
      "fileName": "like",
      "adapter": "nedb",
      "path": "/like",
      "requiresAuth": false,
      "graphql": true
    },
    "post": {
      "name": "post",
      "fileName": "post",
      "adapter": "nedb",
      "path": "/post",
      "requiresAuth": false,
      "graphql": true
    },
    "relationship": {
      "name": "relationship",
      "fileName": "relationship",
      "adapter": "nedb",
      "path": "/relationship",
      "requiresAuth": false,
      "graphql": true
    }
  },
  "connections": {
    "nedb+nedb": {
      "database": "nedb",
      "adapter": "nedb",
      "connectionString": "../data"
    }
  },
  "graphql": {
    "name": "graphql",
    "path": "graphql",
    "strategy": "services",
    "requiresAuth": false
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
