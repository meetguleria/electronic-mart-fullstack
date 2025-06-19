require('dotenv').config();

module.exports = {
  development: {
    url: process.env.CONN_STRING,
    dialect: 'postgres'
  }
}