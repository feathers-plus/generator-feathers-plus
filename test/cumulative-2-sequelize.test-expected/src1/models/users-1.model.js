
// users1-model.js - A Sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
// !code: sequelize_imports // !end
// !code: sequelize_init // !end

let moduleExports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  // !code: sequelize_func_init // !end

  const users1 = sequelizeClient.define('users_1', {
  
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  
  
    auth0Id: { type: Sequelize.STRING },
  
    googleId: { type: Sequelize.STRING },
  
    facebookId: { type: Sequelize.STRING },
  
    githubId: { type: Sequelize.STRING },
  
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users1.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  // !code: sequelize_func_return // !end
  return users1;
};
// !code: sequelize_more // !end

// !code: sequelize_exports // !end
module.exports = moduleExports;

// !code: sequelize_funcs // !end
// !code: sequelize_end // !end
