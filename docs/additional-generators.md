
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

> The generator defaults to JavaScript.
You should run `generate options` before `generate app` if you want to generate a TypeScript project.

#### Converting between JavaScript and TypeScript

You can convert an existing generated project from JavaScript to TypeScript, or vice versa.
First run `generate options` and change to the language you want to convert to.
Then run `generate all`.

The generator will recode the project, install any newly required dependencies,
and then remove the modules of the original language.

Your custom code is not transpiled.
A statement containing TypeScript tags will not be converted to correct JavaScript.
You have to handle that yourself.

> Modules of both languages cannot exist at the same time,
as their duplicate custom code would be combined by the generator.

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