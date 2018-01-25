
## Tests

Repo generator-old-vs-new contains app's generated with the same prompts
using David's generator and the new generator. You can use various tools to compare the source
between these to identify differences in the generated code.

The `t#` dirs contain apps generated using David's generator. The `z#` using the new one.
Matching app's have the same number, i.e. t1 and z1 were generated using the same prompts.

The `z#` are copied to generator-feathers-plus/tests under names like app.test-expected.
This test compares the currently generated source to e.g. app.test-expected which
essentially is a comparision with the source produced by David's generator.

BTW the contents of folders with names like app.test-copied are initially copied to the test dir
before a test is started.
They always contain feathers-gen-specs.json and may contain service models in files like src/services/nedb-1/nedb-1.schema.js

- `npm run mocha:code` will compare the source produced by the tests. Its very fast
because it does not install the dependencies.
- `npm run mocha:tests` will run `npm test` for each test. Its very slow as it has to
install dependencies.
- `npm test` runs both of the above.

The tests stop running on the first assertion failure.