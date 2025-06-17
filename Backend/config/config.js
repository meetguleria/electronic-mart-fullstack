require('dotenv').config();
module.exports = {
  connString: process.env.DB_CONN_STRING,
  dialect: 'postgres',
}