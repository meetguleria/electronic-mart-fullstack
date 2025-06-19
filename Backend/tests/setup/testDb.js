const { sequelize } = require('../../models');

async function setupTestDb() {
  try {
    // Force sync will drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
}

async function clearTestDb() {
  try {
    // Clean all tables but keep the structure
    await sequelize.truncate({ cascade: true });
    console.log('Test database cleared');
  } catch (error) {
    console.error('Test database cleanup failed:', error);
    throw error;
  }
}

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