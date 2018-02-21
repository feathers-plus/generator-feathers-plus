
// nedb2-model.js - A Sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
// !code: sequelize_imports // !end
// !code: sequelize_init // !end

let moduleExports = function (app) {
  let sequelizeClient = app.get('sequelizeClient');
  // !code: sequelize_func_init // !end

  const nedb2 = sequelizeClient.define('nedb_2', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  nedb2.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  // !code: sequelize_func_return // !end
  return nedb2;
};
// !code: sequelize_more // !end

// !code: sequelize_exports // !end
module.exports = moduleExports;

// !code: sequelize_funcs // !end
// !code: sequelize_end // !end
