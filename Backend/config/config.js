require('dotenv').config();

module.exports = {
  development: {
    url: process.env.CONN_STRING,
    dialect: 'postgres'
  },
  test: {
    url: process.env.TEST_CONN_STRING,
    dialect: 'postgres',
    logging: false // Disable logging in test environment
  },
  production: {
    url: process.env.CONN_STRING,
    dialect: 'postgres',
  }
}