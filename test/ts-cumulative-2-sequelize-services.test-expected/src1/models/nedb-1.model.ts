
// nedb1-model.ts - A Sequelize model. (Can be re-generated.)
import { App } from '../app.interface';
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize } from 'sequelize';
import merge from 'lodash.merge';
// !<DEFAULT> code: sequelize_schema
import sequelizeSchema from '../services/nedb-1/nedb-1.sequelize';
// !end
// !code: sequelize_imports // !end
// !code: sequelize_init // !end

let moduleExports = function (app: App) {
  let sequelizeClient = app.get('sequelizeClient') as Sequelize;
  // !code: sequelize_func_init // !end

  const nedb1 = sequelizeClient.define('nedb_1',
    // !<DEFAULT> code: sequelize_model
    sequelizeSchema,
    // !end
    merge(
      // !<DEFAULT> code: sequelize_options
      {
        hooks: {
          beforeCount(options: any) {
            options.raw = true;
          },
        } as any,
      },
      // !end
      // !code: sequelize_define // !end
    )
  );

  // tslint:disable-next-line no-unused-variable
  nedb1.associate = function (models) {
    // Define associations here for foreign keys
    //   - nedb2Id
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // !code: sequelize_associations // !end
  };

  // !code: sequelize_func_return // !end
  return nedb1;
};
// !code: sequelize_more // !end

// !code: sequelize_exports // !end
export default moduleExports;

// !code: sequelize_funcs // !end
// !code: sequelize_end // !end
