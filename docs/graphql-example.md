
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

3. `cli-generator-example` starts a server listening to port 3030.
Check that public/serverUrl.js will point to this server.

4. Start your app

    ```
    npm start
    ```

The app will create the database
and then run a short async test to confirm it is functioning correctly.

## Starting the client test harness

Point your browser at `localhost:3030` and you will see this test harness:

![test harness](./assets/test-harness.jpg)

The client will authenticate with the server before enabling the `Run query` button.

You can run any of the 10 provided queries.
The query appears in the editable window on top
and you can modify any of those queries before running them.

The result (or error message) appears in the bottom window after you click `Run query`.

The examples show that GraphQL keywords are allowed in some of the resolvers.
These keywords are similar to those used with FeathersJS services.
- key: The same as FeathersJS `id`, a numeric or string.
- query: The same as FeathersJS `params.query`.
- params: The same as FeathersJS `params`.

`$` is a reserved character in GraphQL, so Feathers props such as `$sort` and `$in`
would result in GraphQL errors.
You can instead use a double underscore (`__`) where ever you would use a `$` with FeathersJS. 

## Using Graphiql


## Database

This app can use either an NeDB or SQLite database, both of which reside in `./data`.

Both databases have the same structure:

![database stucture](./assets/schema.jpg)

and contain the same data:

![database data](./assets/tables.jpg)

`uuid` fields are used as foreign keys for table relations
so as to avoid differences between `id` and `_id` in different databases.

## What type of resolvers are being used?

The repo on Github is (usually) configured to use Feathers service calls alone.
You can reconfigure it to use either Feathers service calls with
[BatchLoaders](https://feathers-plus.github.io/v1/batch-loader/guide.html)
or with raw SQL statements by running @feathers-plus/cli's `generate graphql` command.

Switching the resolvers being used like this is an interesting example of
the advantages of round-trip regeneration.
 