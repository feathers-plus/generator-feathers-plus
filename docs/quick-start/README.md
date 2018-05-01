# Quick-start

[[toc]]

## Installation

`npm i -g @feathers-x/cli`

::: danger STOP
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
  You can run `npm list -g` to see where global libraries are installed.
:::

## Introduction

The cli-plus is similar to @feathersjs/cli in that:
- It uses the same commends, e.g. `generate service`.
- It prompts with the same questions, e.g. "Which path should the service be registered on?"
- It generates the same modules with pretty much identical code.

However the similarities fundamentally end there.
