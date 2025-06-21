const { sequelize } = require('../../models');

async function setupTestDb() {
  try {
    // Drops all tables & recreates them
    await sequelize.sync({ force: true });
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
}

// alias clear to the same
const clearTestDb = setupTestDb;

async function closeTestDb() {
  try {
    await sequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    throw error;
  }
}

module.exports = {
  setupTestDb,
  clearTestDb,
  closeTestDb
};