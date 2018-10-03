
## generate service

adapter   |            | Feathersjs   | Feathers+    | diff? 
==========|============|==============|==============|=======
custom    |            |              | *none        |
in memory |            |              | *none        |
nedb      |            |              | *none        |
mongodb   |            | mongodb.js   | mongodb.js   |
mongoose  |            | mongoose.js  | mongodb.js   |
sequelize | mysql      |              | sequelize.js |
sequelize | postgresql |              | sequelize.js |
sequelize | sqlite     |              | sequelize.js |
sequelize | sql server |              | *none        | s/b sequelize-mssql.js
knexjs    | mysql      |              | knex.js      |
knexjs    | postgresql |              | knex.js      |
knexjs    | sqlite     |              | knex.js      |
knexjs    | sql server |              | knex.js      |
rethinkdb |            |              | rethinkdb.js |
objection |            |              | n/a          | limited
cassandra |            |              | n/a          | limited



## generate connection

database   | adapter    | Feathersjs   | Feathers+    | diff? 
===========|============|==============|==============|=======
memory     |            | *none        | *none        |
mongodb    | mongodb    | mongodb.js   | mongodb.js   |
mongodb    | mongoose   | mongoose.js  | mongoose.js  |
mysql      | sequelize  | sequelize.js | sequelize.js |
mysql      | knexjs     | knex.js      | knex.js      |
mysql      | objection  | objection.js |              | limited
nedb       |            | *none        | *none        |
postgresql | sequelize  | sequelize.js | sequelize.js |
postgresql | knexjs     | knex.js      | knex.js      |
postgresql | objection  | objection.js |              | limited
rethinkdb  |            | UNDEFINED.js | rethinkdb.js | better
sqlite     | sequelize  | sequelize.js | sequelize.js |
sqlite     | knexjs     | knex.js      | knex.js      |
sqlite     | objection  | objection.js |              | limited 
sql server | sequelize  | sequelize.js | *none        | ERROR
sql server | knexjs     | knex.js      | knex.js      |
sql server | objection  | objection.js |              | limited 
cassandra  |            | *none        |              | limited 
























