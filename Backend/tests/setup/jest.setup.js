const { setupTestDb, clearTestDb, closeTestDb } = require('./testDb');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  await setupTestDb();
});

// Clean database between tests
beforeEach(async () => {
  await clearTestDb();
});

// Cleanup after all tests
afterAll(async () => {
  await closeTestDb();
}); 