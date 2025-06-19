const { User, Role } = require('../../models');
const validateRegistration = require('../../middleware/validateRegisteration');

// Mock the models
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn()
  },
  Role: {
    findOne: jest.fn()
  },
  Sequelize: {
    Op: {
      or: Symbol('or')
    }
  }
}));

describe('validateRegistration middleware', () => {
  let req;
  let res;
  let next;
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('username/email uniqueness', () => {
    it('should proceed if username and email are unique', async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue({ role_id: 2 }); // Default user role

      await validateRegistration(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          [Symbol('or')]: [
            { username: 'testuser' },
            { email: 'test@example.com' }
          ]
        }
      });
      expect(req.role_id).toBe(2);
      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if username/email already exists', async () => {
      User.findOne.mockResolvedValue({ username: 'testuser' });

      await validateRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Username or email already exists'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if username/email check fails', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      await validateRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('role validation', () => {
    it('should assign default user role if no role specified', async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue({ role_id: 2 });

      await validateRegistration(req, res, next);

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { role_name: 'user' }
      });
      expect(req.role_id).toBe(2);
      expect(next).toHaveBeenCalled();
    });

    it('should validate custom role if specified', async () => {
      req.body.role_name = 'admin';
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue({ role_id: 1 });

      await validateRegistration(req, res, next);

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { role_name: 'admin' }
      });
      expect(req.role_id).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if specified role is invalid', async () => {
      req.body.role_name = 'invalid_role';
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue(null);

      await validateRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid role specified.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if role check fails', async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockRejectedValue(new Error('Database error'));

      await validateRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 