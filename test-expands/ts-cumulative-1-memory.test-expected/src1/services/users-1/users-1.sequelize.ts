
/* tslint:disable:quotemark */
// Defines Sequelize model for service `users1`. (Can be re-generated.)
import merge from 'lodash.merge';
import Sequelize, { DefineAttributes } from 'sequelize';
// tslint:disable-next-line no-unused-variable
const DataTypes = (Sequelize as any).DataTypes as Sequelize.DataTypes;
// !code: imports // !end
// !code: init // !end

// Your model may need the following fields:
//   email:      { type: DataTypes.STRING, allowNull: false, unique: true },
//   password:   { type: DataTypes.STRING, allowNull: false },
//   auth0Id:    { type: DataTypes.STRING },
//   googleId:   { type: DataTypes.STRING },
//   facebookId: { type: DataTypes.STRING },
//   githubId:   { type: DataTypes.STRING },
let moduleExports = merge({},
  // !<DEFAULT> code: sequelize_model
  {
    name: {
      type: DataTypes.TEXT
    }
  } as DefineAttributes,
  // !end
  // !code: moduleExports // !end
);

// !code: exports // !end
export default moduleExports;

// !code: funcs // !end
// !code: end // !end
