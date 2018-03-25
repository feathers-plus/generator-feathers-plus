
const adapterInfo = {
  generic: { idName: '_id', idType: 'string' },
  memory: { idName: '_id', idType: 'number' },
  nedb: { idName: '_id', idType: 'string' },
  mongodb: { idName: '_id', idType: 'string' },
  mongoose: { idName: '_id', idType: 'string' },
  sequelize: { idName: 'id', idType: 'number' },
  knex: { idName: 'id', idType: 'number' },
  rethinkdb: { idName: 'id', idType: 'number' },
};

module.exports = function(adapterName) {
  return adapterInfo[adapterName];
};
