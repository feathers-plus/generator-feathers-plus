
const feathersSpecs = {
  nedb1: {
    title: 'Nedb1',
    description: 'Nedb1 database.',
    required: [],
    uniqueItemProperties: [],
    properties: {
      id: { type: 'ID' },
      _id: { type: 'ID' },
      nedb2Id: { type: 'ID' }
    },
    _extensions: {
      graphql: {
        name: 'Nedb1',
        service: { _id: 1 },
        discard: [],
        add: {
          nedb2: {
            type: 'Nedb2!',
            args: '',
            relation: {
              ourTable: 'nedb2Id',
              otherTable: '_id',
              ourTableIsArray: false,
              ourTableSql: 'nedb2Id',
              otherTableName: 'Nedb2',
              otherTableService: 'nedb2',
              otherTableIsArray: false,
              otherTableSql: '_id'
            },
            typeName: 'Nedb2',
            isScalar: false,
            isNullable: false,
            isArray: false,
            isNullableElem: null,
            serviceName: 'nedb2'
          }
        },
        sql: { uniqueKey: 'id', sqlColumn: {} },
        serviceSortParams: ', { query: { $sort: {   _id: 1 } } }'
      },
      primaryKey: { idName: '_id', idType: 'string' },
      foreignKeys: [ 'id', '_id', 'nedb2Id' ],
      _ifGraphql: true
    }
  },
  nedb2: {
    title: 'Nedb2',
    description: 'Nedb2 database.',
    required: [],
    uniqueItemProperties: [],
    properties: {
      id: { type: 'ID' },
      _id: { type: 'ID' },
      nedb1Id: { type: 'ID' }
    },
    _extensions: {
      graphql: {
        name: 'Nedb2',
        service: { _id: 1 },
        discard: [],
        add: {
          nedb1: {
            type: 'Nedb1!',
            args: '',
            relation: {
              ourTable: 'nedb1Id',
              otherTable: '_id',
              ourTableIsArray: false,
              ourTableSql: 'nedb1Id',
              otherTableName: 'Nedb1',
              otherTableService: 'nedb1',
              otherTableIsArray: false,
              otherTableSql: '_id'
            },
            typeName: 'Nedb1',
            isScalar: false,
            isNullable: false,
            isArray: false,
            isNullableElem: null,
            serviceName: 'nedb1'
          }
        },
        sql: { uniqueKey: 'id', sqlColumn: {} },
        serviceSortParams: ', { query: { $sort: {   _id: 1 } } }'
      },
      primaryKey: { idName: '_id', idType: 'string' },
      foreignKeys: [ 'id', '_id', 'nedb1Id' ],
      _ifGraphql: true
    }
  },
  users1: {
    title: 'Users1',
    description: 'Users1 database.',
    _extensions: {
      primaryKey: {
        idName: '_id', idType: 'string'
      },
      foreignKeys: [],
      graphql: {
        service: undefined,
        serviceSortParams: '',
        sql: { uniqueKey: 'id', sqlColumn: {} },
        add: {}
      },
      _ifGraphql: false
    },
    required: [],
    uniqueItemProperties: [],
    properties: {}
  }
};
