const request = require('supertest');
const app = require('../../../server');
const { User, Role } = require('../../../models');

describe('Registration API Integration Tests', () => {
  // Test data
  const validUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    role_name: 'user'
  };

  // Helper function to create roles
  async function setupRoles() {
    await Role.bulkCreate([
      { role_name: 'admin' },
      { role_name: 'user' },
      { role_name: 'moderator' }
    ]);
  }

  beforeEach(async () => {
    // Create necessary roles before each test
    await setupRoles();
  });

  describe('POST /register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send(validUser)
        .expect(201);

      // Assert response structure
      expect(response.body).toHaveProperty('message', 'User registered successfully.');
      expect(response.body).toHaveProperty('user_id');

      // Verify user was actually created in database
      const user = await User.findOne({
        where: { username: validUser.username }
      });
      expect(user).toBeTruthy();
      expect(user.email).toBe(validUser.email);
    });

    it('should not allow duplicate username', async () => {
      // First registration
      await request(app)
        .post('/register')
        .send(validUser);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/register')
        .send(validUser)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Username or email already exists');
    });

    it('should not allow duplicate email', async () => {
      // First registration
      await request(app)
        .post('/register')
        .send(validUser);

      // Attempt registration with same email
      const response = await request(app)
        .post('/register')
        .send({
          ...validUser,
          username: 'different_user'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Username or email already exists');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          ...validUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email format');
    });

    it('should require all necessary fields', async () => {
      const requiredFields = ['username', 'email', 'password'];

      for (const field of requiredFields) {
        const invalidUser = { ...validUser };
        delete invalidUser[field];

        const response = await request(app)
          .post('/register')
          .send(invalidUser)
          .expect(400);

        expect(response.body.message).toContain('required');
      }
    });

    it('should assign default user role when no role specified', async () => {
      const userWithoutRole = { ...validUser };
      delete userWithoutRole.role_name;

      const response = await request(app)
        .post('/register')
        .send(userWithoutRole)
        .expect(201);

      const user = await User.findOne({
        where: { username: validUser.username },
        include: [{ model: Role }]
      });

      expect(user.Role.role_name).toBe('user');
    });

    it('should handle invalid role names', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          ...validUser,
          role_name: 'invalid_role'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid role specified.');
    });

    it('should validate password complexity', async () => {
      const weakPasswords = [
        'short',           // too short
        'onlylowercase',   // no uppercase/numbers
        'ONLYUPPERCASE',   // no lowercase/numbers
        '12345678',        // only numbers
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/register')
          .send({
            ...validUser,
            password
          })
          .expect(400);

        expect(response.body.message).toContain('password');
      }
    });
  });
}); 