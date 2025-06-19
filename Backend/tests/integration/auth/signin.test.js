const request = require('supertest');
const app = require('../../../server');
const { User, Role } = require('../../../models');
const jwt = require('jsonwebtoken');

describe('Sign In API Integration Tests', () => {
  // Test data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    role_name: 'user'
  };

  // Helper function to create a test user
  async function createTestUser() {
    // Create roles first
    const role = await Role.create({ role_name: 'user' });
    
    // Register the test user
    const response = await request(app)
      .post('/register')
      .send(testUser);
    
    return response.body.user_id;
  }

  beforeEach(async () => {
    // Create a fresh test user before each test
    await createTestUser();
  });

  describe('POST /signin', () => {
    it('should successfully sign in and return JWT token', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('role_id');

      // Verify JWT token is valid
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_STRING);
      expect(decodedToken).toHaveProperty('user_id');
      expect(decodedToken).toHaveProperty('role_id');
    });

    it('should return 401 for non-existent username', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          username: 'nonexistent',
          password: testUser.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });

    it('should require both username and password', async () => {
      // Test missing username
      await request(app)
        .post('/signin')
        .send({ password: testUser.password })
        .expect(400);

      // Test missing password
      await request(app)
        .post('/signin')
        .send({ username: testUser.username })
        .expect(400);
    });

    it('should handle multiple sign-in attempts with same credentials', async () => {
      // First sign-in
      const firstResponse = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      // Second sign-in
      const secondResponse = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      // Tokens should be different
      expect(firstResponse.body.token).not.toBe(secondResponse.body.token);
    });

    it('should return user role information', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      // Verify role information
      const user = await User.findOne({
        where: { username: testUser.username },
        include: [{ model: Role }]
      });

      expect(response.body.role_id).toBe(user.role_id);
    });

    it('should handle concurrent sign-in requests', async () => {
      // Send multiple sign-in requests concurrently
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/signin')
          .send({
            username: testUser.username,
            password: testUser.password
          })
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      // All tokens should be unique
      const tokens = responses.map(response => response.body.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('JWT Token Validation', () => {
    it('should generate token with correct expiration', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      const decodedToken = jwt.verify(response.body.token, process.env.JWT_STRING);
      
      // Token should have expiration
      expect(decodedToken).toHaveProperty('exp');
      
      // Expiration should be in the future (1 hour by default)
      const expirationDate = new Date(decodedToken.exp * 1000);
      const now = new Date();
      expect(expirationDate).toBeInstanceOf(Date);
      expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
      
      // Should expire in approximately 1 hour (with 5 second tolerance)
      const diffInSeconds = (expirationDate.getTime() - now.getTime()) / 1000;
      expect(diffInSeconds).toBeCloseTo(3600, -2); // 3600 seconds = 1 hour
    });
  });
}); 