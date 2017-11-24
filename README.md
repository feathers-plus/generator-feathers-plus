# generator-feathers-plus

[![Build Status](https://travis-ci.org/feathers-x/generator-feathers-plus.png?branch=master)](https://travis-ci.org/feathers-x/generator-feathers-plus)
[![Code Climate](https://codeclimate.com/github/feathers-x/generator-feathers-plus/badges/gpa.svg)](https://codeclimate.com/github/feathers-x/generator-feathers-plus)
[![Test Coverage](https://codeclimate.com/github/feathers-x/generator-feathers-plus/badges/coverage.svg)](https://codeclimate.com/github/feathers-x/generator-feathers-plus/coverage)
[![Dependency Status](https://img.shields.io/david/feathers-x/generator-feathers-plus.svg?style=flat-square)](https://david-dm.org/feathers-x/generator-feathers-plus)
[![Download Status](https://img.shields.io/npm/dm/generator-feathers-plus.svg?style=flat-square)](https://www.npmjs.com/package/generator-feathers-plus)

> A yeoman generator to (re)generate a FeathersJS application.

## Installation

```
npm install generator-feathers-plus --save
```

## Documentation

Please refer to the [generator-feathers-plus documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `generator-feathers-plus`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('generator-feathers-plus');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
