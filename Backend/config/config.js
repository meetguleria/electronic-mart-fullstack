require('dotenv').config();

module.exports = {
  development: {
    url: process.env.CONN_STRING,
    dialect: 'postgres'
  },
  test: {
    url: process.env.TEST_CONN_STRING || process.env.CONN_STRING + '_test',
    dialect: 'postgres',
    logging: false // Disable logging in test environment
  }
}