const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signInUser } = require('../../controllers/signInController');
const { User } = require('../../models');
require('dotenv').config();
// Mock the required modules
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn()
  }
}));

describe('signInController', () => {
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
    // Reset mock implementations
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
        username: 'testuser',
        password: 'password123'
      }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('signInUser', () => {
    it('should successfully sign in a user and return JWT token', async () => {
      // Mock user found in database
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role_id: 2
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock successful password comparison
      bcrypt.compare.mockResolvedValue(true);

      // Mock JWT token generation
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      await signInUser(req, res);

      // Verify user lookup
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });

      // Verify password comparison
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');

      // Verify JWT generation using actual JWT_STRING from .env
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role_id: 2 },
        process.env.JWT_STRING,
        { expiresIn: '1h' }
      );

      // Verify response
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        username: 'testuser',
        user_id: 1,
        role_id: 2
      });
    });

    it('should return 401 for non-existent username', async () => {
      // Mock user not found
      User.findOne.mockResolvedValue(null);

      await signInUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid username or password'
      });
    });

    it('should return 401 for incorrect password', async () => {
      // Mock user found but password doesn't match
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role_id: 2
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await signInUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid username or password'
      });
    });

    it('should handle database errors during user lookup', async () => {
      // Mock database error
      User.findOne.mockRejectedValue(new Error('Database error'));

      await signInUser(req, res);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle bcrypt comparison errors', async () => {
      // Mock user found but bcrypt fails
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role_id: 2
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

      await signInUser(req, res);

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle JWT signing errors', async () => {
      // Mock user found and password matches but JWT signing fails
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role_id: 2
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => {
        throw new Error('JWT signing error');
      });

      await signInUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
    });

    it('should handle missing username or password', async () => {
      // Test with missing username
      req.body = { password: 'password123' };
      await signInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Username and password are required'
      });

      // Reset mocks
      jest.clearAllMocks();

      // Test with missing password
      req.body = { username: 'testuser' };
      await signInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Username and password are required'
      });
    });
  });
});
