const bcrypt = require('bcryptjs');
const { registerUser } = require('../../controllers/registrationController');
const { User } = require('../../models');

// Mock the models and bcrypt
jest.mock('../../models', () => ({
  User: {
    create: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

describe('registrationController', () => {
  let req;
  let res;
  let consoleErrorSpy;

  beforeAll(() => {
    // Spy on console.error and silence it
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Reset mock implementations and mock data
    jest.clearAllMocks();
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      },
      role_id: 2 // Assuming 2 is for regular users
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      // Mock successful password hashing
      const hashedPassword = 'hashedPassword123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock successful user creation
      const newUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role_id: 2
      };
      User.create.mockResolvedValue(newUser);

      await registerUser(req, res);

      // Verify bcrypt was called with correct parameters
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      // Verify User.create was called with correct data
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role_id: 2
      });

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully.',
        user_id: 1
      });
    });

    it('should handle password hashing error', async () => {
      // Mock bcrypt hash failure
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      await registerUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle database error during user creation', async () => {
      // Mock successful password hashing
      bcrypt.hash.mockResolvedValue('hashedPassword123');

      // Mock database error
      User.create.mockRejectedValue(new Error('Database error'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle missing required fields', async () => {
      // Remove required fields from request
      req.body = {};

      // Mock bcrypt hash failure since password will be undefined
      bcrypt.hash.mockRejectedValue(new Error('Cannot hash undefined password'));

      await registerUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle invalid email format', async () => {
      // Set invalid email
      req.body.email = 'invalid-email';
      
      // Mock successful password hashing
      const hashedPassword = 'hashedPassword123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock validation error
      User.create.mockRejectedValue(new Error('Validation error: Invalid email format'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle missing individual required fields', async () => {
      const requiredFields = ['username', 'email', 'password'];
      
      for (const field of requiredFields) {
        // Create a new request body missing one field
        const bodyWithMissingField = { ...req.body };
        delete bodyWithMissingField[field];
        req.body = bodyWithMissingField;

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Internal Server Error'
        });

        // Reset the response mock for the next iteration
        res.status.mockClear();
        res.json.mockClear();
      }
    });
  });
}); 