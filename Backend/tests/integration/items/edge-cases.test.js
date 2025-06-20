const request = require('supertest');
const app = require('../../../app');
const { User, Role } = require('../../../models');

describe('Edge Cases & Resilience Tests', () => {
  let adminToken;

  beforeAll(async () => {
    // Create admin role and user
    const role = await Role.findOrCreate({
      where: { role_name: 'admin' },
      defaults: { role_name: 'admin' }
    });

    const user = await User.create({
      username: 'edge_test_admin',
      email: 'edge_test_admin@example.com',
      password: 'Password123!',
      role_id: role[0].role_id
    });

    // Get admin token
    const response = await request(app)
      .post('/signin')
      .send({
        username: 'edge_test_admin',
        password: 'Password123!'
      });

    adminToken = response.body.token;
  });

  describe('SQL Injection Prevention Tests', () => {
    it('should sanitize SQL injection in item name', async () => {
      const maliciousItem = {
        item_name: "Malicious'); DROP TABLE ElectronicsItems; --",
        item_quantity: 1,
        item_price: 99.99
      };

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousItem)
        .expect(201);

      // Verify item was created normally
      expect(response.body.item).toHaveProperty('item_name', maliciousItem.item_name);
    });

    it('should handle SQL injection in query parameters', async () => {
      await request(app)
        .get('/all_items?search=1 OR 1=1')
        .expect(200);
    });

    it('should sanitize SQL injection in item ID parameter', async () => {
      const itemId = "1; DROP TABLE ElectronicsItems; --";
      
      await request(app)
        .delete(`/delete/item/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404); // Should return 404 as the ID is invalid
    });
  });

  describe('Large Payload Tests', () => {
    it('should handle item with very long name', async () => {
      const longName = 'a'.repeat(1000);
      const largeItem = {
        item_name: longName,
        item_quantity: 1,
        item_price: 99.99
      };

      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(largeItem)
        .expect(400); // Assuming there's a validation limit on name length
    });

    it('should handle very large numbers', async () => {
      const largeNumberItem = {
        item_name: 'Test Item',
        item_quantity: Number.MAX_SAFE_INTEGER + 1,
        item_price: 1e20
      };

      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(largeNumberItem)
        .expect(400); // Assuming there's validation for reasonable number ranges
    });

    it('should handle large number of items in bulk request', async () => {
      const items = Array(1000).fill().map((_, i) => ({
        item_name: `Bulk Item ${i}`,
        item_quantity: 1,
        item_price: 99.99
      }));

      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(items)
        .expect(400); // Assuming there's a limit on bulk operations
    });
  });

  describe('Special Characters & Encoding Tests', () => {
    it('should handle special characters in item name', async () => {
      const specialCharsItem = {
        item_name: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\',
        item_quantity: 1,
        item_price: 99.99
      };

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(specialCharsItem)
        .expect(201);

      expect(response.body.item).toHaveProperty('item_name', specialCharsItem.item_name);
    });

    it('should handle unicode characters in item name', async () => {
      const unicodeItem = {
        item_name: '电子产品 - エレクトロニクス - 전자제품',
        item_quantity: 1,
        item_price: 99.99
      };

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(unicodeItem)
        .expect(201);

      expect(response.body.item).toHaveProperty('item_name', unicodeItem.item_name);
    });

    it('should handle HTML/script tags in item name', async () => {
      const xssItem = {
        item_name: '<script>alert("xss")</script><img src="x" onerror="alert(1)">',
        item_quantity: 1,
        item_price: 99.99
      };

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(xssItem)
        .expect(201);

      // Verify that HTML is escaped or sanitized
      expect(response.body.item.item_name).not.toContain('<script>');
    });
  });

  describe('Input Type Tests', () => {
    it('should handle wrong data types', async () => {
      const wrongTypesItem = {
        item_name: 123, // number instead of string
        item_quantity: '10', // string instead of number
        item_price: 'expensive' // string instead of number
      };

      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(wrongTypesItem)
        .expect(400);
    });

    it('should handle missing required fields', async () => {
      const incompleteItem = {
        item_name: 'Test Item'
        // missing item_quantity and item_price
      };

      await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteItem)
        .expect(400);
    });

    it('should handle additional unknown fields', async () => {
      const extraFieldsItem = {
        item_name: 'Test Item',
        item_quantity: 1,
        item_price: 99.99,
        unknown_field: 'should be ignored',
        another_field: 123
      };

      const response = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(extraFieldsItem)
        .expect(201);

      // Verify extra fields are not saved
      expect(response.body.item).not.toHaveProperty('unknown_field');
      expect(response.body.item).not.toHaveProperty('another_field');
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle multiple simultaneous create requests', async () => {
      const item = {
        item_name: 'Concurrent Test Item',
        item_quantity: 1,
        item_price: 99.99
      };

      // Create 10 concurrent requests
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/create_item')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(item)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Each item should have a unique ID
      const itemIds = responses.map(response => response.body.item.item_id);
      const uniqueIds = new Set(itemIds);
      expect(uniqueIds.size).toBe(promises.length);
    });

    it('should handle concurrent updates to same item', async () => {
      // Create an item first
      const createResponse = await request(app)
        .post('/create_item')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Concurrent Update Test Item',
          item_quantity: 10,
          item_price: 99.99
        });

      const itemId = createResponse.body.item.item_id;

      // Try to update the same item concurrently
      const promises = Array(5).fill().map((_, i) =>
        request(app)
          .put(`/update/item/${itemId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ item_quantity: i + 1 })
      );

      const responses = await Promise.all(promises);
      
      // All requests should return success
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Final state should be consistent
      const finalResponse = await request(app)
        .get('/all_items')
        .expect(200);

      const updatedItem = finalResponse.body.items.find(item => item.item_id === itemId);
      expect(updatedItem).toBeTruthy();
      expect(updatedItem.item_quantity).toBeGreaterThan(0);
    });
  });
}); 