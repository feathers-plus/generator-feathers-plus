# @feathers-plus/cli a.k.a. cli-plus

## Installation

`npm i -g @feathers-x/cli`

`generator-feathers-plus` is not automatically installed as a dependency
during the development period.

Do the following so that any change you make in @feathers-x/generator-feathers-plus
will be immediately reflected in @feathers-x/cli.

- Clone `@feathers-x/generator-feathers-plus`.
- [Symlink](https://medium.com/trisfera/the-magic-behind-npm-link-d94dcb3a81af)
it into @feathers-x/cli.
  - In @feathers-x/generator-feathers-plus, run `npm symlink`.
  - In @feathers-x/cli, run `npm symlink @feathers-x/generator-feathers-plus`.
  The location containing the global @feathers-x/cli will vary based on your OS.

## Introduction

The cli-plus is similar to @feathersjs/cli in that:
- It uses the same commends, e.g. `generate service`.
- It prompts with the same questions, e.g. "Which path should the service be registered on?"
- It generates the same modules with pretty much identical code.

However the similarities fundamentally end there.

## [Regenerating apps](./docs/regenerating-apps.md)

## [Retaining custom code](./docs/retaining-custom-code.md)

## [Feathers service models](./docs/feathers-service-models.md)

## [Writing JSON-schema](./docs/writing-json-schema.md)

## [GraphQL](./docs/graphql.md)

## [GraphQL example](./docs/graphql-example.md)

## [GraphQL pagination proposal](./docs/graphql-pagination.md)

## [Tests](./docs/tests.md)

## [Database Maintainers](./docs/database-maintainers.md)