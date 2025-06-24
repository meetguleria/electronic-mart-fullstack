const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../app');
const { User, Role } = require('../../../models');

describe('Authorization Integration Tests', () => {
  let validToken;
  const testItem = {
    item_name: 'Test Item',
    item_quantity: 10,
    item_price: 99.99
  };

  beforeAll(async () => {
    // Get valid token for global admin user
    const response = await request(app)
      .post('/signin')
      .send({
        username: 'global_admin',
        password: 'StrongP@ssw0rd!'
      });
    validToken = response.body.token;
  });

  describe('JWT Authentication Tests', () => {
    it('should reject requests with missing Authorization header', async () => {
      const response = await request(app)
        .post('/create_item')
        .send(testItem)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Token Missing');
    });

    it('should reject requests with malformed token', async () => {
      const response = await request(app)
        .post('/create_item')
        .set('Authorization', 'Bearer invalid.token.here')
        .send(testItem)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid Token');
    });

    it('should reject requests with expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: 1, username: 'test', role: 'admin' },
        process.env.JWT_STRING,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(testItem)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid Token');
    });

    it('should accept requests with valid token', async () => {
      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${validToken}`)
        .send(testItem)
        .expect(201);
    });
  });

  describe('Role-Based Authorization Tests', () => {
    let userToken, modToken;

    beforeAll(async () => {
      // Create roles if they don't exist
      await Role.findOrCreate({
        where: { role_name: 'user' },
        defaults: { role_name: 'user' }
      });
      await Role.findOrCreate({
        where: { role_name: 'moderator' },
        defaults: { role_name: 'moderator' }
      });

      // Create test users and get their tokens
      async function createUserAndGetToken(username, role_name) {
        const role = await Role.findOne({ where: { role_name } });
        const user = await User.create({
          username,
          email: `${username}@example.com`,
          password: 'Password123!',
          role_id: role.role_id
        });

        const response = await request(app)
          .post('/signin')
          .send({
            username,
            password: 'Password123!'
          });

        return response.body.token;
      }

      userToken = await createUserAndGetToken('auth_test_user', 'user');
      modToken = await createUserAndGetToken('auth_test_mod', 'moderator');
    });

    describe('Admin-only endpoints', () => {
      it('should allow admin access to create_item', async () => {
        await request(app)
          .post('/create_item')
          .set('Authorization', `Bearer ${validToken}`)
          .send(testItem)
          .expect(201);
      });

      it('should deny user access to create_item', async () => {
        await request(app)
          .post('/create_item')
          .set('Authorization', `Bearer ${userToken}`)
          .send(testItem)
          .expect(403);
      });

      it('should deny moderator access to create_item', async () => {
        await request(app)
          .post('/create_item')
          .set('Authorization', `Bearer ${modToken}`)
          .send(testItem)
          .expect(403);
      });
    });

    describe('Admin/Moderator endpoints', () => {
      let itemId;

      beforeEach(async () => {
        // Create a test item
        const response = await request(app)
          .post('/create_item')
          .set('Authorization', `Bearer ${validToken}`)
          .send(testItem);
        itemId = response.body.item.item_id;
      });

      it('should allow admin access to update item', async () => {
        await request(app)
          .put(`/update/item/${itemId}`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({ item_quantity: 20 })
          .expect(200);
      });

      it('should allow moderator access to update item', async () => {
        await request(app)
          .put(`/update/item/${itemId}`)
          .set('Authorization', `Bearer ${modToken}`)
          .send({ item_quantity: 20 })
          .expect(200);
      });

      it('should deny user access to update item', async () => {
        await request(app)
          .put(`/update/item/${itemId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ item_quantity: 20 })
          .expect(403);
      });
    });

    describe('Public endpoints', () => {
      it('should allow access to all_items without token', async () => {
        await request(app)
          .get('/all_items')
          .expect(200);
      });

      it('should allow access to all_items with any role', async () => {
        await request(app)
          .get('/all_items')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        await request(app)
          .get('/all_items')
          .set('Authorization', `Bearer ${modToken}`)
          .expect(200);

        await request(app)
          .get('/all_items')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);
      });
    });
  });
}); 