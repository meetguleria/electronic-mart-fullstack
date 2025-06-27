const request = require('supertest');
const app = require('../../../app');
const { User, Role, ElectronicsItem } = require('../../../models');

describe('Electronics Items CRUD Integration Tests', () => {
  let adminToken, userToken, modToken;
  const testItem = {
    item_name: 'Test Phone',
    item_quantity: 10,
    item_price: 999.99
  };

  // Helper function to create a user and get token
  async function createUserAndGetToken(username, role_name) {
    // Register the test user via the API (password hashed)
    await request(app)
      .post('/register')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'Password123!',
        role_name
      })
      .expect(201);

    // Sign in to get a valid JWT
    const response = await request(app)
      .post('/signin')
      .send({
        username,
        password: 'Password123!'
      })
      .expect(200);

    return response.body.token;
  }

  beforeAll(async () => {
    // Create users with different roles and get their tokens
    adminToken = await createUserAndGetToken('admin_test', 'admin');
    userToken = await createUserAndGetToken('user_test', 'user');
    modToken = await createUserAndGetToken('mod_test', 'moderator');
  });

  describe('GET /all_items', () => {
    it('should return empty array when no items exist', async () => {
      // Ensure database is empty
      await ElectronicsItem.destroy({ where: {} });

      const response = await request(app)
        .get('/all_items')
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(0);
    });

    it('should return correct list after seeding items', async () => {
      // Create test items
      const items = await ElectronicsItem.bulkCreate([
        { item_name: 'Phone 1', item_quantity: 5, item_price: 599.99 },
        { item_name: 'Laptop 1', item_quantity: 3, item_price: 1299.99 }
      ]);

      const response = await request(app)
        .get('/all_items')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toHaveProperty('item_name', 'Phone 1');
      expect(response.body.items[1]).toHaveProperty('item_name', 'Laptop 1');
    });
  });

  describe('POST /create_item', () => {
    it('should create item with admin token', async () => {
      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testItem)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Item created!');
      expect(response.body.item).toHaveProperty('item_name', testItem.item_name);

      // Verify item in database
      const item = await ElectronicsItem.findOne({
        where: { item_name: testItem.item_name }
      });
      expect(item).toBeTruthy();
      expect(item.item_quantity).toBe(testItem.item_quantity);
    });

    it('should reject creation with user token', async () => {
      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testItem)
        .expect(403);
    });

    it('should reject creation with mod token', async () => {
      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${modToken}`)
        .send(testItem)
        .expect(403);
    });
  });

  describe('PUT /update/item/:id', () => {
    let testItemId;

    beforeEach(async () => {
      // Create a test item
      const item = await ElectronicsItem.create(testItem);
      testItemId = item.item_id;
    });

    it('should update item with admin token', async () => {
      const updateData = { item_quantity: 20 };
      
      const response = await request(app)
        .put(`/update/item/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item updated!');

      // Verify update in database
      const item = await ElectronicsItem.findByPk(testItemId);
      expect(item.item_quantity).toBe(20);
    });

    it('should update item with mod token', async () => {
      const updateData = { item_quantity: 15 };
      
      await request(app)
        .put(`/update/item/${testItemId}`)
        .set('Authorization', `Bearer ${modToken}`)
        .send(updateData)
        .expect(200);
    });

    it('should reject update with user token', async () => {
      await request(app)
        .put(`/update/item/${testItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ item_quantity: 25 })
        .expect(403);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .put('/update/item/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ item_quantity: 30 })
        .expect(404);
    });
  });

  describe('DELETE /delete/item/:id', () => {
    let testItemId;

    beforeEach(async () => {
      // Create a test item
      const item = await ElectronicsItem.create(testItem);
      testItemId = item.item_id;
    });

    it('should delete item with admin token', async () => {
      await request(app)
        .delete(`/delete/item/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify item is deleted
      const item = await ElectronicsItem.findByPk(testItemId);
      expect(item).toBeNull();
    });

    it('should reject deletion with mod token', async () => {
      await request(app)
        .delete(`/delete/item/${testItemId}`)
        .set('Authorization', `Bearer ${modToken}`)
        .expect(403);
    });

    it('should reject deletion with user token', async () => {
      await request(app)
        .delete(`/delete/item/${testItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .delete('/delete/item/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 