// test environment
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');
const { setupTestDb, closeTestDb } = require('./testDb');
const { sequelize, Role } = require('../../models');

// Helper to seed roles and a global admin user
async function seedDatabase() {
  // Seed roles
  await Role.bulkCreate([
    { role_name: 'admin' },
    { role_name: 'user' },
    { role_name: 'moderator' }
  ]);
  // Register global admin
  await request(app)
    .post('/register')
    .send({
      username: 'global_admin',
      email: 'admin@example.com',
      password: 'StrongP@ssw0rd!',
      role_name: 'admin'
    });
}

beforeAll(async () => {
  // Drop and recreate test tables
  await setupTestDb();
  // Seed roles and global admin
  await seedDatabase();
});

beforeEach(async () => {
  // Clean out only ElectronicsItems between tests
  await sequelize.getQueryInterface().bulkDelete('ElectronicsItems', null, {});
});

afterAll(async () => {
  // Shutdown the connection pool
  await closeTestDb();
});