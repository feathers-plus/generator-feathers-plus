
const adapterInfo = {
  generic: { idName: 'id', idType: 'numeric' },
  memory: { idName: '_id', idType: 'numeric' },
  nedb: { idName: '_id', idType: 'string' },
  mongodb: { idName: '_id', idType: 'string' },
  mongoose: { idName: '_id', idType: 'string' },
  sequelize: { idName: 'id', idType: 'numeric' },
  knex: { idName: 'id', idType: 'numeric' },
  rethinkdb: { idName: 'id', idType: 'numeric' },
};

module.exports = function(adapterName) {
  return adapterInfo[adapterName];
};
