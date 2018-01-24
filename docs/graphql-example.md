
## GraphQL example

> Example Feathers app using the @feathers-plus/cli generator and the @feathers-plus/graphql adapter to expose a GraphQL endpoint.


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

## Database

This app can use either an NeDB or SQLite database, both of which reside in `./data`.

Both databases have the same structure:

![database stucture](./assets/schema.jpg)

and contain the same data:

![database data](./assets/tables.jpg)
