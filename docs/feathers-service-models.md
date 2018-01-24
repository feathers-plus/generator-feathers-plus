
## Feathers Service Models

Most database systems use a [schema](https://en.wikipedia.org/wiki/Database_schema)
to describe how the data in a database table or collection is organized,
as well as how the different schemas relate to one another.
Unfortunately, schemas are normally not shareable between different databases.
The Mongoose database adapter, for example, will not understand a schema
written for the Sequelize database adapter.

However if you use Feathers Service Models,
Feathers can automatically convert your Feathers model into the schema expected by
a particular database adapter.

> **ProTip:** Presently, the Mongoose database adapter is supported.
Sequelize adapters will be supported next.

With Feathers service adapters and Feathers Models you can connect to the most popular databases and
query them with a unified interface no matter which one you use.
This makes it easy to swap databases and use entirely different DBs in the same app
without changing your application code.

### JSON-schema

Feathers Models are based on [JSON-schema](http://json-schema.org/).
JSON-schema is the most popular way to describe the structure of
[JSON](https://en.wikipedia.org/wiki/JSON)
data and, since JSON data is essentially just plain old JavaScript objects,
this makes JSON-schema a great fit for Feathers Models.

JSON-schema:

- has the widest adoption among all standards for JSON validation.
- is very mature (current version is 6).
- covers a big part of validation scenarios.
- uses easy-to-parse JSON documents for schemas.
- is platform independent.
- is easily extensible.
- has 30+ validators for different languages, including 10+ for JavaScript,
so no need to code validators yourself.

The [`validateSchema`](https://feathers-plus.github.io/v1/feathers-hooks-common/index.html#validateSchema)
common hook already uses JSON-data for verification.

### Swagger and OpenAPI

Swagger and OpenAPI are 2 more reasons to use JSON-schema.

[Swagger](https://swagger.io/)
is a popular tool which allows you to describe the structure of your APIs
so that machines can read them.

Swagger uses a *subset* of JSON-schema to describe its data formats.

> **ProTip:** You can use `feathers-swagger` to expose your Swagger definitions.

The recent [OpenAPI Initiative](https://www.openapis.org/blog/2017/07/26/the-oai-announces-the-openapi-specification-3-0-0#)
(OAI), a Linux Foundation project created to advance API technology,
provides a foundation for developing interoperability of APIs and other technologies.
Its members include Adobe, Google, IBM, Microsoft, Oracle, PayPal, RedHat and Salesforce.

OAI v2 was essentially Swagger.
The v3 release is the culmination of nearly two years of collaboration among senior API developers
and architects from across multiple industries, such as payment and banking, cloud computing,
the Internet of Things, and vendors building API solutions.

OAI's data formats use JSON-schema.


### Easy to get started

JSON-schema is easy to write, and there are some great
[tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343).

Thankfully, you don't have to learn how to write JSON-schema before you can start writing your app.
There is wide support for JSON-schema online, including utilities which you can leverage to write your Feathers Models.

You can
- Generate a Feathers Model online by pasting a JavaScript object.
- Generate Feathers Models by providing a utility the contents of your database.
- Generate Feathers Models from
[Mongoose](http://mongoosejs.com/docs/schematypes.html) schemas or
[Sequelize](http://docs.sequelizejs.com/class/lib/model.js~Model.html) models.
- Generate Feathers Models from Walmart's [Joi](https://github.com/hapijs/joi)
object validation schemas.

Finally, you can test your JSON-schema by running a utility against your existing data.

### More generated code

Cli-plus will write useful modules when you provide a model for a Feathers service.
These include:
- Schemas to valid your data for create, update and patch service calls. (available)
- A GraphQL endpoint. (available).
- Schemas for fastJoin to populate your data on the server. (TBA)
- Generate test data. (TBA)
- Help generating the UI for
  - [React forms](https://github.com/mozilla-services/react-jsonschema-form).
  - [React with redux-form](https://limenius.github.io/liform-react/#/).
  - Vue.
