
module.exports = {
  // Configuration for faking service data
  fakeData: {
    // Number of records to generate if JSON-schema does not have a fakeRecords property.
    defaultFakeRecords: 5,
    // https://github.com/json-schema-faker/json-schema-faker#custom-options
    jsf: {
      // Don't throw exception when invalid type passed.
      failOnInvalidTypes: false,
      // Default value generated for a schema with invalid type (works only if failOnInvalidTypes is set to false)
      defaultInvalidTypeProduct: 'string',
      // Don't throw exception when invalid format passed.
      failOnInvalidFormat: false,
      // Configure a maximum amount of items to generate in an array.
      // This will override the maximum items found inside a JSON Schema.
      maxItems: 15,
      // Configure a maximum length to allow generating strings for.
      // This will override the maximum length found inside a JSON Schema.
      maxLength: 40,
      // A replacement for Math.random to support pseudorandom number generation.
      // random: () => (),
      // A number from 0 to 1 indicating the probability to fake a non-required object property.
      // When 0.0, only required properties are generated; when 1.0, all properties are generated.
      optionalsProbability: 1.0,
      // Support  JSONPath expressions such as jsonPath: '$..book[?(@.price<30 && @.category=="fiction")]'
      // https://github.com/dchester/jsonpath
      resolveJsonPath: true,
      // Custom seeders.
      extend: {
        // Invoked with: format: 'foo'
        // foo: () => jsf.random.randexp('\\d\\.\\d\\.[1-9]\\d?');,
      },

    },
    // https://github.com/Marak/Faker.js#localization
    faker: {
      // If you want consistent results, you can set your own seed.
      seed: undefined,
      // Language to generate for.
      locale: 'en',
      // Fallback language for missing definitions.
      localeFallback: 'en',
      // Custom seeders.
      // faz: {
           // Invoked with: faker: 'faz.foo', faker: { 'faz.foo': 'bar' } or faker: { 'faz.foo': ['bar', 'baz'] }
           // foo: (p1 = 'hello', p2 = 'world') => `${p1} ${p2}`,
      // },
    },
    // http://chancejs.com/usage/seed.html
    chance: {
      // If you want consistent results, you can set your own seed.
      seed: undefined,
      // Custom seeders.
      // Invoked with: chance: 'foo', chance: { foo: 'bar' } or chance: { foo: ['bar', 'baz'] }
      // foo: (p1 = 'hello', p2 = 'world') => `${p1} ${p2}`,
    },
  }
};
