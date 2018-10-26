
const mapping = {
  feathers:
    { nedb1: { graphql: 'Nedb1', path: '/nedb-1', adapter: 'nedb' },
      nedb2: { graphql: 'Nedb2', path: '/nedb-2', adapter: 'nedb' }
    },
  graphqlService:
    { Nedb1: { service: 'nedb1', path: '/nedb-1', adapter: 'nedb' },
      Nedb2: { service: 'nedb2', path: '/nedb-2', adapter: 'nedb' } },
  graphqlSql: {}
};
