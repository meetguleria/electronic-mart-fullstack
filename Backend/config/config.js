require('dotenv').config();
module.exports = {
  connString: process.env.CONN_STRING,
  dialect: 'postgres',
}