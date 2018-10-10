cli+ v0.7.48 which uses generator v0.6.46
=========================================
(1) The generator now validates the JSON-schema for each service as it generates it.
Errors are logged to the console but the generation continues.

Only the valid JSON-schema keywords are checked. So the "extensions" property is not validated,
nor are non-JSON-schema keywords such as "faker".

A successful validation does not mean all the features in that JSON-schema can be fully implemented
in a TypeScript interface, a Mongoose or Sequelize model. It just means the JSON-schema properties
are well formed.

The DB models can be selectively "patched" in, say, services/name/name.mongoose.?s at code location
"moduleExports", so tighter JSON-schema validation does not seem appropriate.

Write your JSON-schema with an eye for tight validation. Modify the resultant DB models as
required.

(2) Test scaffolding has been written for comparing JSON-schema to generated models.
It's given the feathers-gen-specs.json and the services' JSON-schema; it generates the
TypeScript, Mongoose, Sequelize models; it compares those to the expected results.

The first 2 tests have been written, with more to come sporadically. This will become a repository
of what JSON-schema conversions are possible.

(3) The JSON-schema ENUM has been implemented for Sequelize. It was painful.