
## GraphQL example

> @feathers-plus/cli-generator-example: Example Feathers app using the @feathers-plus/cli generator and the @feathers-plus/graphql adapter to expose a GraphQL endpoint.


## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/cli-generator-example
    npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Starting the app

Point your browser at `localhost:3030` and you will see this test harness:

![test harness](./assets/test-harness.jpg)

You can run any of the 10 provided queries.
The query appears in the editable window on top.
The result (or error message) appears in the bottom window after you click `Run query`.

You can modify any of those queries before running them.

The keys allowed with some of the resolvers are Feathers service-like:
- key: The same as Feathers `id`, numeric or string.
- query: The same as Feathers `params.query`.
- params: The same as Feathers `params`.

`$` is a reserved character in GraphQL, so Feathers props such as `$sort` and `$in` will result in GraphQL errors.
You can instead use a double underscore `__` where ever would use a `$` with Feathers. 

## Database

This app can use either an NeDB or SQLite database, both of which reside in `./data`.

Both databases have the same structure:

![database stucture](./assets/schema.jpg)

and contain the same data:

![database data](./assets/tables.jpg)

## What type of resolvers are being used

The repo on Github is (usually) configured to use Feathers service calls alone.
You can reconfigure it to use either Feathers service calls with
[BatchLoaders](https://feathers-plus.github.io/v1/batch-loader/guide.html)
or with raw SQL statements by running @feathers-plus/cli's `generate graphql` command.
