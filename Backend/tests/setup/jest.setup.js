const { setupTestDb, clearTestDb, closeTestDb } = require('./testDb');

// Set test environment
process.env.NODE_ENV = 'test';

const { sequelize } = require('../../models');
const request = require('supertest');
const app = require('../../app');

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  try {
    // Full sync + seed roles once
    await sequelize.sync({ force: true });
    
    // Wait a moment for models to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const db = require('../../models');
    console.log('Available models:', Object.keys(db));
    
    // Temporarily skip Role setup for electronicsItemController tests
    // const { Role } = db;
    
    // if (!Role) {
    //   console.error('Role model not found in db:', Object.keys(db));
    //   throw new Error('Role model not available');
    // }
    
    // await Role.bulkCreate([
    //   { role_name: 'admin' },
    //   { role_name: 'user' },
    //   { role_name: 'moderator' }
    // ]);

    // Register a global admin user for all tests
    // await request(app)
    //   .post('/register')
    //   .send({
    //     username: 'global_admin',
    //     email: 'admin@example.com',
    //     password: 'StrongP@ssw0rd!',
    //     role_name: 'admin'
    //   });
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Clean database between tests
beforeEach(async () => {
  // truncate all tables between tests
  await sequelize.truncate({ cascade: true });
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});