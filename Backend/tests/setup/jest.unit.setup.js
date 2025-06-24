// Always run in test mode
process.env.NODE_ENV = 'test';

// Mock bcrypt for unit tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('fake-hash'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock JWT for unit tests
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockResolvedValue('fake-token'),
  verify: jest.fn().mockResolvedValue({ user_id: 1, role_id: 1 }),
}));

// Mock validator for unit tests
jest.mock('validator', () => ({
  isEmail: jest.fn().mockReturnValue(true),
}));

// Prevent Squelize from connecting to the database
jest.mock('../../models', () => {
  const makeMockModel = () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  });

  return {
    // Mock models
    ElectronicsItem: makeMockModel(),
    User: makeMockModel(),
    Role: makeMockModel(),
    // Stub out sequelize instance with mock
    sequelize: {
      sync: jest.fn(),
      authenticate: jest.fn(),
      close: jest.fn(),
    },
    Sequelize: require('sequelize')
  };
});